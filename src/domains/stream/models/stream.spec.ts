import { Stream } from './stream';
import { Song } from './song';
import { BumpType, SongRequestStatus } from '../../../types/song-request';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'node:test';

const mockEventBridgeClient = mockClient(EventBridgeClient);

describe('Stream', () => {
  beforeEach(() => {
    mockEventBridgeClient.on(PutEventsCommand).resolves({});
  });

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
          status: SongRequestStatus.QUEUED,
          duration: 300
        },
        {
          id: '2',
          requestedBy: 'user2',
          title: 'Song 2',
          status: SongRequestStatus.QUEUED,
          duration: 200
        }
      ]
    };

    const stream = Stream.load(data);

    expect(stream).toBeInstanceOf(Stream);
    expect(stream.getStreamDate()).toBe(data.streamDate);
    expect(stream.getSongQueue().length).toBe(2);
  });

  describe('moveSong', () => {
    let stream: Stream;

    beforeEach(async () => {
      const streamDate = '2023-10-01';
      stream = Stream.create(streamDate);

      const songs = [
        Song.load('1', 'Vin', 'Song 1', SongRequestStatus.QUEUED, 300),
        Song.load('2', 'Kelsier', 'Song 2', SongRequestStatus.QUEUED, 250),
        Song.load('3', 'Sazed', 'Song 3', SongRequestStatus.QUEUED, 200),
        Song.load('4', 'Elend', 'Song 4', SongRequestStatus.QUEUED, 180),
        Song.load('5', 'Marsh', 'Song 5', SongRequestStatus.QUEUED, 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }
    });

    it('should move a song to a new position in the queue', () => {
      stream.moveSong('2', 5);

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue[0].id).toBe('1');
      expect(songQueue[1].id).toBe('3');
      expect(songQueue[2].id).toBe('4');
      expect(songQueue[3].id).toBe('5');
      expect(songQueue[4].id).toBe('2');
    });

    it('should throw an error if the queue is empty', () => {
      const stream = Stream.create('2023-10-01');
      const songQueue = stream.getSongQueue();

      expect(songQueue.length).toBe(0);
      expect(() => stream.moveSong('1', 2)).toThrow('Queue is empty');
    });

    it('should throw an error if the song is not in the queue', () => {
      expect(() => stream.moveSong('6', 2)).toThrow(
        'Request not found in queue'
      );
    });
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
        Song.load('1', 'Vin', 'Song 1', SongRequestStatus.QUEUED, 300),
        Song.load('2', 'Kelsier', 'Song 2', SongRequestStatus.QUEUED, 250),
        Song.load('3', 'Sazed', 'Song 3', SongRequestStatus.QUEUED, 200),
        Song.load('4', 'Elend', 'Song 4', SongRequestStatus.QUEUED, 180),
        Song.load('5', 'Marsh', 'Song 5', SongRequestStatus.QUEUED, 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }

      await stream.bumpSongForUser('Sazed', BumpType.Bean);

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue[0].id).toBe('3');
      expect(songQueue[0].status).toBe(SongRequestStatus.BUMPED);
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
        stream.bumpSongForUser('user1', BumpType.Bean, undefined, false)
      ).rejects.toThrow('User is not eligible for a free bump');
    });

    it('should bump a song for a user with channel points', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      jest
        .spyOn(stream['bumpService'], 'isUserEligible')
        .mockResolvedValue(true);

      const songs = [
        Song.load('1', 'Vin', 'Song 1', SongRequestStatus.QUEUED, 300),
        Song.load('2', 'Kelsier', 'Song 2', SongRequestStatus.QUEUED, 250),
        Song.load('3', 'Sazed', 'Song 3', SongRequestStatus.QUEUED, 200),
        Song.load('4', 'Elend', 'Song 4', SongRequestStatus.QUEUED, 180),
        Song.load('5', 'Marsh', 'Song 5', SongRequestStatus.QUEUED, 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }

      await stream.bumpSongForUser('Sazed', BumpType.ChannelPoints);

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue[0].id).toBe('3');
      expect(songQueue[0].status).toBe(SongRequestStatus.BUMPED);
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

  describe('removeSongFromQueue', () => {
    it('should remove a song from the queue', async () => {
      const streamDate = '2023-10-01';
      const stream = Stream.create(streamDate);

      const songs = [
        Song.load('1', 'Vin', 'Song 1', SongRequestStatus.QUEUED, 300),
        Song.load('2', 'Kelsier', 'Song 2', SongRequestStatus.QUEUED, 250),
        Song.load('3', 'Sazed', 'Song 3', SongRequestStatus.QUEUED, 200),
        Song.load('4', 'Elend', 'Song 4', SongRequestStatus.QUEUED, 180),
        Song.load('5', 'Marsh', 'Song 5', SongRequestStatus.QUEUED, 220)
      ];

      for (const song of songs) {
        await stream.addSongToQueue(song);
      }

      stream.removeSongFromQueue('3');

      const songQueue = stream.getSongQueue();
      console.log(songQueue);

      expect(songQueue.length).toBe(4);
      expect(songQueue[0].id).toBe('1');
      expect(songQueue[1].id).toBe('2');
      expect(songQueue[2].id).toBe('4');
      expect(songQueue[3].id).toBe('5');
    });

    it('should throw an error if the queue is empty', () => {
      const stream = Stream.create('2023-10-01');
      const songQueue = stream.getSongQueue();

      expect(songQueue.length).toBe(0);
      expect(() => stream.removeSongFromQueue('1')).toThrow('Queue is empty');
    });
  });
});
