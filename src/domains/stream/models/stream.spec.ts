import { Stream } from './stream';
import { Song } from './song';
import { BumpType } from '../../../types/song-request';

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

  describe('bumpSongForUser', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should bump a song for a user with bean bump', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      jest
        .spyOn(stream['bumpService'], 'isUserEligible')
        .mockResolvedValue(true);

      const songs = [
        Song.load('1', 'Vin', 'Song 1', 'in queue', 300),
        Song.load('2', 'Kelsier', 'Song 2', 'in queue', 250),
        Song.load('3', 'Sazed', 'Song 3', 'in queue', 200),
        Song.load('4', 'Elend', 'Song 4', 'in queue', 180),
        Song.load('5', 'Marsh', 'Song 5', 'in queue', 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }

      await stream.bumpSongForUser('Sazed', BumpType.Bean);

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue[0].id).toBe('3');
      expect(songQueue[0].status).toBe('bumped');
      expect(stream.getAvailableBeanBumps()).toBe(2);
    });

    it('should throw an error if no bean bumps are available', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      stream['beanBumpsAvailable'] = 0;

      await expect(
        stream.bumpSongForUser('user1', BumpType.Bean)
      ).rejects.toThrow('No bumps available for type [bean]');
    });

    it('should throw an error if user is not eligible for a free bump', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      jest
        .spyOn(stream['bumpService'], 'isUserEligible')
        .mockResolvedValue(false);

      await expect(
        stream.bumpSongForUser('user1', BumpType.Bean)
      ).rejects.toThrow('User is not eligible for a free bump');
    });

    it('should bump a song for a user with channel points', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      jest
        .spyOn(stream['bumpService'], 'isUserEligible')
        .mockResolvedValue(true);

      const songs = [
        Song.load('1', 'Vin', 'Song 1', 'in queue', 300),
        Song.load('2', 'Kelsier', 'Song 2', 'in queue', 250),
        Song.load('3', 'Sazed', 'Song 3', 'in queue', 200),
        Song.load('4', 'Elend', 'Song 4', 'in queue', 180),
        Song.load('5', 'Marsh', 'Song 5', 'in queue', 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }

      await stream.bumpSongForUser('Sazed', BumpType.ChannelPoints);

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue[0].id).toBe('3');
      expect(songQueue[0].status).toBe('bumped');
      expect(stream.getAvailableChannelPointBumps()).toBe(2);
    });

    it('should throw an error if no channel point bumps are available', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      stream['channelPointBumpsAvailable'] = 0;

      await expect(
        stream.bumpSongForUser('user1', BumpType.ChannelPoints)
      ).rejects.toThrow('No bumps available for type [channelPoints]');
    });
  });
});
