import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { SongQueueRepository } from './repositories/song-queue-repository';
import {
  AddSongToQueueResult,
  SongInfo,
  SongQueueItem,
  SongRequest,
  SongRequestErrorCode,
  SongRequestResult,
  ValidationResult
} from './types/song-request';
import { generateStreamDate, secondsToMinutes } from './utils/utilities';
import { Logger } from '@aws-lambda-powertools/logger';

export class SongQueue {
  private songs: SongQueueItem[] = [];
  private songRepository = new SongQueueRepository();
  private streamDate: string;
  private logger = new Logger({ serviceName: 'song-queue' });

  private ssmClient;

  private constructor() {
    this.ssmClient = new SSMClient({ region: 'us-east-1' });
  }

  static async loadQueue() {
    console.log('Creating new queue');
    const queue = new SongQueue();

    queue.streamDate = generateStreamDate();
    console.log(`Trying to load queue for stream date: ${queue.streamDate}`);
    await queue.load();

    console.log(`Queue loaded with ${queue.getLength()} songs`);
    console.log(`Queue: ${JSON.stringify(queue.toArray(), null, 2)}`);

    return queue;
  }

  async load() {
    this.songs = await this.songRepository.getQueue(this.streamDate);
  }

  async addSong(song: SongRequest): Promise<ValidationResult<SongQueueItem>> {
    const maxDuration = await this.getMaxDuration();
    const maxSongsPerUser = await this.getMaxNumberOfRequests();

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

  toArray() {
    return this.songs;
  }

  getLength() {
    return this.songs.length;
  }

  /* istanbul ignore next */
  async clear() {
    this.songs = [];
    await this.songRepository.deleteQueue(this);
  }

  /* istanbul ignore next */
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
}
