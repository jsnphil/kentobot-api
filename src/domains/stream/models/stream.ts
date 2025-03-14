import { StringConcat } from 'aws-cdk-lib';
import { Song } from '../../song/models/song';
import { SongQueue } from '../../song/models/song-queue';
import { SamlConsolePrincipal } from 'aws-cdk-lib/aws-iam';
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

  public static load(data: any): Stream {
    // if (!data || typeof data.streamDate !== 'string') {
    //   throw new Error('Invalid data');
    // }

    console.log('Loading stream');
    console.log(JSON.stringify(data, null, 2));

    // const songData = JSON.parse(data).songQueue;
    console.log(data.songQueue);
    console.log(typeof data.songQueue);

    const songQueueArray = data.songQueue as any[];
    console.log(typeof songQueueArray);

    const songs: Song[] = [];
    songQueueArray.forEach((songAttrs: any) => {
      const song = Song.load(
        songAttrs.id,
        songAttrs.requestedBy,
        songAttrs.title,
        songAttrs.status,
        songAttrs.duration
      );

      console.log('Song loaded');
      console.log(JSON.stringify(song, null, 2));
      // songQueue.addSong(song);
      songs.push(song);
    });

    const songQueue = new SongQueue(songs);

    console.log('Loaded song queue');
    console.log(JSON.stringify(songQueue, null, 2));

    const newStream = new Stream(data.streamDate, songQueue);

    console.log('Loaded stream');
    console.log(JSON.stringify(newStream, null, 2));
    return newStream;
  }

  public static create(streamDate: string): Stream {
    const songQueue = new SongQueue();

    // const songHistory = SongHistory.create();
    // const bumpCounts = BumpCount.create();

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
