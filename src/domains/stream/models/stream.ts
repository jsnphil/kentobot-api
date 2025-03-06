import { BumpCount } from "./bump-count";
import { SongQueue } from "./song-queue";

export class Stream {
  private _streamDate: Date;
  private _songQueue: SongQueue;
  //   private _songHistory: SongHistory;
  private _bumpCounts: BumpCount;

  private constructor(
    streamDate: Date,
    songQueue: SongQueue,
    // songHistory: SongHistory,
    bumpCounts: BumpCount
  ) {
    this._streamDate = streamDate;
    this._songQueue = songQueue;
    // this._songHistory = songHistory;
    this._bumpCounts = bumpCounts;
  }
}
