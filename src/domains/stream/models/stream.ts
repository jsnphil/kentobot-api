import { EventPublisher } from '../../../common/event-publisher';
import { StreamEvent } from '../../../types/event-types';
import { Song } from './song';
import { SongQueue } from './song-queue';
import { SongMovedInQueueEvent } from '../events/song-moved-in-queue-event';
import { SongRemovedFromQueue } from '../events/song-removed-from-queue-event';
import { BumpType } from '../../../types/song-request';
// import { BumpCount } from './bump-count';

export class Stream {
  private streamDate: string;
  private songQueue: SongQueue;
  private beanBumpsAvailable: number;
  channelPointBumpsAvailable: number;
  //   private _songHistory: SongHistory;
  // private bumpCounts: BumpCount;
  // public bumpCounts: Map<string, number>; // Tracks how many bumps each user has used

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
    if (bumpType === BumpType.Bean && this.beanBumpsAvailable > 0) {
      throw new Error('No bean bumps available');
    }

    // TODO Check the user is eligible to bump, or that a mod is overriding

    const song = this.songQueue.getSongByUser(user);
    if (!song) {
      throw new Error('User does not have a song in the queue');
    }

    if (song.status === 'bumped') {
      throw new Error('Song is already bumped');
    }

    const bumpPosition = position || this.getBumpPosition();

    this.songQueue.moveSong(song.id, bumpPosition);

    // TODO Update the user's elibility to bump

    this.decrementBumpCount(bumpType);
  }

  getBumpPosition(): number {
    const queue = this.songQueue.getSongQueue();

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'bumped') {
        return i + 1;
      }
    }

    return 0;
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
}
