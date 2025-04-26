import { EventPublisher } from '../../../common/event-publisher';
import { StreamEvent } from '../../../types/event-types';
import { Song } from './song';
import { SongQueue } from './song-queue';
import { SongMovedInQueueEvent } from '../events/song-moved-in-queue-event';
import { SongRemovedFromQueue } from '../events/song-removed-from-queue-event';
import { BumpType, SongRequestStatus } from '../../../types/song-request';
import { BumpService } from '../services/bump-service';
import { SongBumpedEvent } from '../events/song-bumped-event';
import { SongAddedToQueueEvent } from '../events/song-added-to-queue-event';
import { SongPlayedEvent } from '../events/song-played-event';

export class Stream {
  private streamDate: string;
  private songQueue: SongQueue;
  private beanBumpsAvailable: number;
  private channelPointBumpsAvailable: number;
  private songHistory: Song[]; // List of songs that have been played in the stream

  private bumpService;

  private constructor(streamDate: string, songQueue: SongQueue) {
    this.streamDate = streamDate;
    this.songQueue = songQueue;
    this.beanBumpsAvailable = 3;
    this.channelPointBumpsAvailable = 3;
    this.bumpService = new BumpService();
    this.songHistory = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static load(data: any): Stream {
    const songs: Song[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.songQueue.songs.forEach((songAttrs: any) => {
      const song = Song.load(
        songAttrs.id,
        songAttrs.requestedBy,
        songAttrs.title,
        songAttrs.status,
        songAttrs.duration
      );

      songs.push(song);
    });

    const songQueue = new SongQueue(songs);

    const stream = new Stream(data.streamDate, songQueue);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.songHistory.forEach((playedSongs: any) => {
      const song = Song.load(
        playedSongs.id,
        playedSongs.requestedBy,
        playedSongs.title,
        playedSongs.status,
        playedSongs.duration
      );

      stream.songHistory.push(song);
    });

    return stream;
  }

  public static create(streamDate: string): Stream {
    const songQueue = new SongQueue();
    return new Stream(streamDate, songQueue);
  }

  public async addSongToQueue(song: Song) {
    this.songQueue.addSong(song);

    await EventPublisher.publishEvent(
      new SongAddedToQueueEvent(song),
      StreamEvent.SONG_ADDED_TO_QUEUE
    );
  }

  public removeSongFromQueue(songId: string) {
    this.songQueue.removeSong(songId);

    EventPublisher.publishEvent(
      new SongRemovedFromQueue(songId),
      StreamEvent.SONG_REMOVED_FROM_QUEUE
    );
  }

  public moveSong(songId: string, newPosition: number) {
    this.songQueue.moveSong(songId, newPosition - 1);

    EventPublisher.publishEvent(
      new SongMovedInQueueEvent(songId, newPosition),
      StreamEvent.SONG_MOVED
    );
  }

  public async bumpSongForUser(
    user: string,
    bumpType: BumpType,
    position?: number,
    modOverride?: boolean
  ) {
    if (!this.bumpAvailable(bumpType)) {
      throw new Error(`No bumps available for type [${bumpType}]`);
    }

    const isUserEligible = await this.bumpService.isUserEligible(
      user,
      bumpType
    );

    // TODO need to check list of bumps from the stream to see if the user has already used their bump when redeeming a paid bump

    if (!isUserEligible && !modOverride) {
      throw new Error('User is not eligible for a free bump');
    }

    const { songId, bumpPosition } = this.songQueue.bumpUserRequest(
      user,
      bumpType,
      position
    );

    this.decrementBumpCount(bumpType);

    EventPublisher.publishEvent(
      new SongBumpedEvent(songId, bumpPosition),
      StreamEvent.SONG_BUMPED
    );
  }

  bumpAvailable(bumpType: BumpType) {
    if (bumpType === BumpType.Bean) {
      return this.beanBumpsAvailable > 0;
    } else if (bumpType === BumpType.ChannelPoints) {
      return this.channelPointBumpsAvailable > 0;
    }

    // This should never happen in reality
    /* istanbul ignore next */
    throw new Error('Invalid bump type');
  }

  decrementBumpCount(bumpType: BumpType) {
    if (bumpType === BumpType.Bean) {
      this.beanBumpsAvailable--;
    } else if (bumpType === BumpType.ChannelPoints) {
      this.channelPointBumpsAvailable--;
    }
  }

  public getSongQueue(): SongQueue {
    return this.songQueue;
  }

  public getStreamDate(): string {
    return this.streamDate;
  }

  public getAvailableBeanBumps(): number {
    return this.beanBumpsAvailable;
  }

  public getAvailableChannelPointBumps(): number {
    return this.channelPointBumpsAvailable;
  }

  public getSongHistory(): Song[] {
    return this.songHistory;
  }

  public savePlayedSong(song: Song) {
    this.songHistory.push(song);

    EventPublisher.publishEvent(
      new SongPlayedEvent(
        song.id,
        song.requestedBy,
        song.title,
        song.duration,
        new Date()
      ),
      StreamEvent.SONG_PLAYED
    );
  }

  public bumpShuffleWinner(shuffleWinner: string) {
    const song = this.songQueue.getSongRequestByUser(shuffleWinner);
    if (!song) {
      throw new Error(`No song found for user: ${shuffleWinner}`);
    }

    song.status = SongRequestStatus.SHUFFLE_WINNER;

    this.songQueue.moveSong(song.id, 0);

    EventPublisher.publishEvent(
      new SongBumpedEvent(song.id, 0),
      StreamEvent.SONG_BUMPED
    );
  }
}
