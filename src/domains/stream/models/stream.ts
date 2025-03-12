import { StringConcat } from 'aws-cdk-lib';
import { Song } from '../../song/models/song';
import { SongQueue } from '../../song/models/song-queue';
// import { BumpCount } from './bump-count';

export class Stream {
  private streamDate: string;
  private songQueue: SongQueue;
  //   private _songHistory: SongHistory;
  // private bumpCounts: BumpCount;
  // public bumpCounts: Map<string, number>, // Tracks how many bumps each user has used

  private constructor(
    streamDate: string,
    songQueue: SongQueue
    // songHistory: SongHistory,
    // bumpCounts: BumpCount
  ) {
    this.streamDate = streamDate;
    this.songQueue = songQueue;
    // this._songHistory = songHistory;
    // this.bumpCounts = bumpCounts;
  }

  public static load(
    streamDate: string,
    songQueue: SongQueue
    // songHistory: SongHistory,
    // bumpCounts: BumpCount
  ): Stream {
    return new Stream(streamDate, songQueue);
  }

  public static create(streamDate: string): Stream {
    const songQueue = SongQueue.create();

    // const songHistory = SongHistory.create();
    // const bumpCounts = BumpCount.create();

    return new Stream(streamDate, songQueue);
  }

  public async addSongToQueue(song: Song) {
    this.songQueue.addSong(song);
  }

  public getSongQueue(): Song[] {
    return this.songQueue.getSongQueue();
  }

  public getStreamDate(): string {
    return this.streamDate;
  }
}
