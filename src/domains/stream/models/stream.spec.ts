import { Stream } from './stream';
import { Song } from '../../song/models/song';
import { SongQueue } from '../../song/models/song-queue';

describe('Stream', () => {
  it('should create a new Stream instance', () => {
    const streamDate = '2023-10-01';
    const stream = Stream.create(streamDate);

    expect(stream).toBeInstanceOf(Stream);
    expect(stream.getStreamDate()).toBe(streamDate);
    expect(stream.getSongQueue()).toEqual([]);
  });

  it('should load a Stream instance from data', () => {
    const data: any = {
      streamDate: '2023-10-01',
      songQueue: [
        {
          id: '1',
          requestedBy: 'user1',
          title: 'Song 1',
          status: 'queued',
          duration: 300
        },
        {
          id: '2',
          requestedBy: 'user2',
          title: 'Song 2',
          status: 'queued',
          duration: 200
        }
      ]
    };

    const stream = Stream.load(data);

    expect(stream).toBeInstanceOf(Stream);
    expect(stream.getStreamDate()).toBe(data.streamDate);
    expect(stream.getSongQueue().length).toBe(2);
  });

  it('should add a song to the queue', async () => {
    const streamDate = '2023-10-01';
    const stream = Stream.create(streamDate);

    const song = Song.load('1', 'user1', 'Song 1', 'in queue', 300);
    await stream.addSongToQueue(song);

    const songQueue = stream.getSongQueue();
    expect(songQueue.length).toBe(1);
    expect(songQueue[0]).toEqual(song);
  });

  // it('should throw an error when loading invalid data', () => {
  //   const invalidData = {
  //     songData: [
  //       {
  //         id: '1',
  //         requestedBy: 'user1',
  //         title: 'Song 1',
  //         status: 'queued',
  //         duration: 300
  //       }
  //     ]
  //   };

  //   expect(() => Stream.load(invalidData)).toThrow('Invalid data');
  // });
});
