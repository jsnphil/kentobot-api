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
  }

  public getSongQueue(): Song[] {
    return this.songQueue.getSongQueue();
  }

  public getStreamDate(): string {
    return this.streamDate;
  }
}
