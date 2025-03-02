import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { SongQueueRepository } from './repositories/song-queue-repository';
import {
  AddSongToQueueResult,
  BumpType,
  QueueManagementErrorCode,
  SongInfo,
  SongQueueItem,
  SongRequest,
  SongRequestErrorCode,
  SongRequestResult,
  ValidationResult
} from './types/song-request';
import { generateStreamDate, secondsToMinutes } from './utils/utilities';
import { Logger } from '@aws-lambda-powertools/logger';
import { BumpService } from './services/bump-service';
import { SongRequestService } from './services/song-request-service';
import { BumpRequest } from '@schemas/bump-schema';

export class SongQueue {
  private songs: SongQueueItem[] = [];
  private songRepository = new SongQueueRepository();
  private streamDate: string;
  private logger = new Logger({ serviceName: 'song-queue' });
  private bumpService = new BumpService();
  private songRequestService = new SongRequestService();

  private ssmClient;

  private constructor() {
    this.ssmClient = new SSMClient({ region: 'us-east-1' });
  }

  static async loadQueue() {
    const queue = new SongQueue();

    queue.streamDate = generateStreamDate();
    await queue.load();

    return queue;
  }

  async load() {
    this.songs = await this.songRepository.getQueue(this.streamDate);
  }

  async addSong(song: SongRequest): Promise<ValidationResult<SongQueueItem>> {
    const maxDuration = await this.getMaxDuration();
    const maxSongsPerUser = await this.getMaxNumberOfRequests();
    const queueStatus = await this.songRequestService.getQueueStatus();

    if (queueStatus === 'closed') {
      return {
        success: false,
        errors: [
          {
            code: SongRequestErrorCode.QUEUE_CLOSED,
            message: SongRequestErrorCode.QUEUE_CLOSED.toString()
          }
        ]
      };
    }

    const queueRules = [
      {
        code: SongRequestErrorCode.SONG_ALREADY_REQUESTED,
        name: 'Song is already in the queue',
        fn: (song: SongRequest) =>
          !this.songs.find((s) => s.youtubeId === song.youtubeId)
      },
      {
        code: SongRequestErrorCode.USER_MAX_REQUESTS,
        name: `User already has ${maxSongsPerUser} song(s) in the queue`,
        fn: (song: SongRequest) => {
          const userSongsCount = this.songs.filter(
            (s) => s.requestedBy === song.requestedBy
          ).length;
          return userSongsCount < maxSongsPerUser || song.allowOverride;
        }
      },
      {
        code: SongRequestErrorCode.SONG_EXCEEDEDS_MAX_DURATION,
        name: `Song length must be under ${secondsToMinutes(maxDuration)}`,
        fn: async (song: SongRequest) => {
          return song.length <= maxDuration;
        }
      }
    ];

    for (const rule of queueRules) {
      const result = await rule.fn(song);
      if (!result) {
        return {
          success: false,
          errors: [
            {
              code: rule.code,
              message: rule.name
            }
          ]
        };
      }
    }

    this.songs.push({
      youtubeId: song.youtubeId,
      title: song.title,
      length: song.length,
      requestedBy: song.requestedBy,
      isBumped: false,
      isShuffled: false,
      isShuffleEntered: false
    });

    this.logger.info(
      `Song [${song.youtubeId}], requested by [${song.requestedBy}] added to queue`
    );

    return {
      success: true,
      data: {
        youtubeId: song.youtubeId,
        title: song.title,
        length: song.length,
        requestedBy: song.requestedBy,
        isBumped: false,
        isShuffled: false,
        isShuffleEntered: false
      }
    };
  }

  removeSong(youtubeId: string) {
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.youtubeId === youtubeId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    this.songs.splice(index, 1);
  }

  removeSongForUser(requestedBy: string) {
    const index = this.songs.findIndex(
      (song) => song.requestedBy === requestedBy
    );

    if (index === -1) {
      throw new Error('User does not have a song in the queue');
    }

    this.removeSong(this.songs[index].youtubeId);
  }

  findSongById(youtubeId: string) {
    return this.songs.find((song) => song.youtubeId === youtubeId);
  }

  findSongByUser(requestedBy: string) {
    return this.songs.find((song) => song.requestedBy === requestedBy);
  }

  moveSong(youtubeId: string, position: number) {
    this.logger.debug(`Moving song to position: ${position}`);
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.youtubeId === youtubeId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    const song = this.songs[index];
    this.songs.splice(index, 1);
    this.songs.splice(position - 1, 0, song);
  }

  // TODO Most of this logic needs to be in bump-service
  async bumpSong(
    youtubeId: string,
    bumpType: BumpType,
    position?: number,
    modAllowed?: boolean
  ): Promise<ValidationResult<any>> {
    if (this.songs.length === 0) {
      return {
        success: false,
        errors: [
          {
            code: QueueManagementErrorCode.QUEUE_EMPTY,
            message: QueueManagementErrorCode.QUEUE_EMPTY.toString()
          }
        ]
      };
    }

    const songToBump = this.findSongById(youtubeId);
    if (!songToBump) {
      return {
        success: false,
        errors: [
          {
            code: QueueManagementErrorCode.REQUEST_NOT_FOUND,
            message: QueueManagementErrorCode.REQUEST_NOT_FOUND.toString()
          }
        ]
      };
    }

    const bumpAllowed = await this.bumpService.isBumpAllowed(
      songToBump?.requestedBy,
      bumpType,
      modAllowed
    );

    this.logger.debug(`Bump allowed: ${JSON.stringify(bumpAllowed)}`);
    this.logger.debug(`Override: ${modAllowed}`);

    if (!bumpAllowed.success && !modAllowed) {
      return bumpAllowed;
    }

    const newPosition = position
      ? position
      : this.bumpService.getBumpPosition(this);

    this.logger.debug(`New position: ${newPosition}`);

    this.moveSong(youtubeId, newPosition);
    songToBump.isBumped = true;

    const result = this.bumpService.setBumpExpiration(
      songToBump.requestedBy,
      bumpType
    );

    return {
      success: true
    };
  }

  toArray() {
    return this.songs;
  }

  getLength() {
    return this.songs.length;
  }

  async clear() {
    this.songs = [];
    await this.songRepository.deleteQueue(this);
  }

  async save() {
    await this.songRepository.saveQueue(this);
  }

  /* istanbul ignore next */
  getStreamDate() {
    return this.streamDate;
  }

  async getMaxDuration() {
    const response = await this.ssmClient.send(
      new GetParameterCommand({
        Name: process.env.REQUEST_DURATION_NAME
      })
    );
    return Number(response.Parameter?.Value);
  }

  async getMaxNumberOfRequests() {
    const response = await this.ssmClient.send(
      new GetParameterCommand({
        Name: process.env.MAX_SONGS_PER_USER
      })
    );
    return Number(response.Parameter?.Value);
  }

  getNextSong(): SongQueueItem | undefined {
    return this.songs.shift();
  }

  enterShuffle(user: string) {
    let songFound = false;

    this.songs.map((song) => {
      if (song.requestedBy === user) {
        if (song.isShuffleEntered) {
          throw new Error('User has already entered the shuffle');
        }
        song.isShuffleEntered = true;
        songFound = true;
      }
    });

    if (!songFound) {
      throw new Error('User does not have a song in the queue');
    }
  }
}
