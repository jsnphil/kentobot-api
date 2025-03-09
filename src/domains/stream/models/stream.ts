import { Song } from '../../song/models/song';
import { SongQueue } from '../../song/models/song-queue';
// import { BumpCount } from './bump-count';

export class Stream {
  private streamDate: Date;
  private songQueue: SongQueue;
  //   private _songHistory: SongHistory;
  // private bumpCounts: BumpCount;
  // public bumpCounts: Map<string, number>, // Tracks how many bumps each user has used

  private constructor(
    streamDate: Date,
    songQueue: SongQueue
    // songHistory: SongHistory,
    // bumpCounts: BumpCount
  ) {
    this.streamDate = streamDate;
    this.songQueue = songQueue;
    // this._songHistory = songHistory;
    // this.bumpCounts = bumpCounts;
  }

  public static create(
    streamDate: Date,
    songQueue: SongQueue
    // songHistory: SongHistory,
    // bumpCounts: BumpCount
  ): Stream {
    return new Stream(streamDate, songQueue);
  }

  public async addSongToQueue(song: Song) {
    this.songQueue.addSong(song);
  }
}
