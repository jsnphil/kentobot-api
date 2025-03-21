import { EventPublisher } from '../../../common/event-publisher';
import { StreamEvent } from '../../../types/event-types';
import { Song } from './song';
import { SongQueue } from './song-queue';
import { SongMovedInQueueEvent } from '../events/song-moved-in-queue-event';
import { SongRemovedFromQueue } from '../events/song-removed-from-queue-event';
import { BumpType } from '../../../types/song-request';
import { BumpService } from '../services/bump-service';
import { SongBumpedEvent } from '../events/song-bumped-event';
// import { BumpCount } from './bump-count';

export class Stream {
  private streamDate: string;
  private songQueue: SongQueue;
  private beanBumpsAvailable: number;
  channelPointBumpsAvailable: number;
  //   private _songHistory: SongHistory;
  // private bumpCounts: BumpCount;
  // public bumpCounts: Map<string, number>; // Tracks how many bumps each user has used

  private bumpService;

  private constructor(
    streamDate: string,
    songQueue: SongQueue
    // songHistory: SongHistory,
    // bumpCounts: BumpCount
  ) {
    this.streamDate = streamDate;
    this.songQueue = songQueue;
    this.beanBumpsAvailable = 3;
    this.channelPointBumpsAvailable = 3;
    // this._songHistory = songHistory;
    // this.bumpCounts = bumpCounts;
    this.bumpService = new BumpService();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static load(data: any): Stream {
    // TODO Eventually figure out why this type conversion is necessary
    let songQueueArray;
    if (typeof data.songQueue == 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      songQueueArray = JSON.parse(data.songQueue) as any[];
    } else {
      songQueueArray = data.songQueue;
    }

    const songs: Song[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    songQueueArray.forEach((songAttrs: any) => {
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

    return stream;
  }

  public static create(streamDate: string): Stream {
    const songQueue = new SongQueue();
    return new Stream(streamDate, songQueue);
  }

  public async addSongToQueue(song: Song) {
    await this.songQueue.addSong(song);
    // TODO Fire event
  }

  public async removeSongFromQueue(songId: string) {
    await this.songQueue.removeSong(songId);

    await EventPublisher.publishEvent(
      new SongRemovedFromQueue(songId),
      StreamEvent.SONG_REMOVED_FROM_QUEUE // TODO Make this an enum
    );
  }

  public async moveSong(songId: string, newPosition: number) {
    await this.songQueue.moveSong(songId, newPosition);

    await EventPublisher.publishEvent(
      new SongMovedInQueueEvent(songId, newPosition),
      StreamEvent.SONG_MOVED // TODO Make this an enum
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

    const bumpEligibility = await this.bumpService.isUserEligible(
      user,
      bumpType
    );
    console.log(
      `Bump eligibility: ${bumpEligibility}, Mod override: ${modOverride}`
    );

    // TODO need to check list of bumps from the stream to see if the user has already used their bump when redeeming a paid bump
    if (!this.bumpService.isUserEligible(user, bumpType) || !modOverride) {
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

    throw new Error('Invalid bump type');
  }

  decrementBumpCount(bumpType: BumpType) {
    if (bumpType === BumpType.Bean) {
      this.beanBumpsAvailable--;
    } else if (bumpType === BumpType.ChannelPoints) {
      // TODO Implement

      this.channelPointBumpsAvailable--;
    }
  }

  public getSongQueue(): Song[] {
    return this.songQueue.getSongQueue();
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
}
