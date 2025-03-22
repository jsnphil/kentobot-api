import { SongQueue } from './song-queue';
import { Song } from './song';
import { BumpType, SongRequestStatus } from '../../../types/song-request';

jest.mock('../../../common/event-publisher');

describe('SongQueue', () => {
  let songQueue: SongQueue;
  let song1: Song;
  let song2: Song;
  let song3: Song;

  beforeEach(() => {
    song1 = {
      id: '1',
      title: 'Song 1',
      requestedBy: 'Vin',
      duration: 300,
      status: SongRequestStatus.QUEUED
    };
    song2 = {
      id: '2',
      title: 'Song 2',
      requestedBy: 'Kelsier',
      duration: 300,
      status: SongRequestStatus.QUEUED
    };
    song3 = {
      id: '3',
      title: 'Song 3',
      requestedBy: 'Elend',
      duration: 300,
      status: SongRequestStatus.QUEUED
    };
    songQueue = new SongQueue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addSong', () => {
    it('should add a song to the queue', async () => {
      await songQueue.addSong(song1);
      expect(songQueue.getSongQueue()).toContain(song1);
    });

    it('should throw an error if the song already exists in the queue', () => {
      songQueue.addSong(song1);
      expect(() => songQueue.addSong(song1)).toThrow(
        'Song already exists in the queue'
      );
    });

    it('should throw an error if the user already has a song in the queue', () => {
      songQueue.addSong(song1);

      const song = Song.load(
        'songId',
        'Vin',
        'Song 4',
        SongRequestStatus.QUEUED,
        300
      );
      expect(() => songQueue.addSong(song)).toThrow(
        'User already has a song in the queue'
      );
    });
  });

  describe('removeSong', () => {
    it('should remove a song from the queue', () => {
      songQueue.addSong(song1);
      songQueue.removeSong(song1.id);
      expect(songQueue.getSongQueue()).not.toContain(song1);
    });

    it('should throw an error if the queue is empty', () => {
      expect(() => songQueue.removeSong(song1.id)).toThrow('Queue is empty');
    });

    it('should throw an error if the song is not found in the queue', () => {
      songQueue.addSong(song1);
      expect(() => songQueue.removeSong('non-existent-id')).toThrow(
        'Request not found in queue'
      );
    });
  });

  describe('getSongQueue', () => {
    it('should return the current song queue', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      expect(songQueue.getSongQueue()).toEqual([song1, song2]);
    });

    it('should return an empty array if the queue is empty', () => {
      expect(songQueue.getSongQueue()).toEqual([]);
    });
  });

  describe('moveSong', () => {
    it('should move a song to a new position in the queue', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      songQueue.moveSong(song2.id, 3);

      const songQueueArray = songQueue.getSongQueue();
      expect(songQueueArray[0]).toBe(song1);
      expect(songQueueArray[1]).toBe(song3);
      expect(songQueueArray[2]).toBe(song2);
    });

    it('should throw an error if the queue is empty', () => {
      expect(() => songQueue.moveSong(song1.id, 2)).toThrow('Queue is empty');
    });

    it('should throw an error if the song is not in the queue', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      expect(() => songQueue.moveSong('non-existent-id', 2)).toThrow(
        'Request not found in queue'
      );
    });
  });

  describe('bumpUserRequest', () => {
    it('should bump a user request to a new position in the queue', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      songQueue.bumpUserRequest('Elend', BumpType.Bean);

      const songQueueArray = songQueue.getSongQueue();
      expect(songQueueArray[0].status).toBe(SongRequestStatus.BUMPED);
      expect(songQueueArray[0].requestedBy).toBe('Elend');
      expect(songQueueArray[1]).toBe(song1);
      expect(songQueueArray[2]).toBe(song2);
    });

    it('should throw an error if the queue is empty', () => {
      expect(() => songQueue.bumpUserRequest('Vin', BumpType.Bean)).toThrow(
        'Queue is empty'
      );
    });

    it('should throw an error if the song is not in the queue', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      expect(() => songQueue.bumpUserRequest('Spook', BumpType.Bean)).toThrow(
        'Request not found in queue'
      );
    });
  });

  describe('getBumpPosition', () => {
    it('should return the correct position for a bump', () => {
      songQueue.addSong(song1);
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      const position = songQueue.getBumpPosition(2);
      expect(position).toBe(1);
    });

    it('should return the last position if no position is provided', () => {
      songQueue.addSong({ ...song1, status: SongRequestStatus.BUMPED });
      songQueue.addSong(song2);
      songQueue.addSong(song3);

      const position = songQueue.getBumpPosition(undefined);
      expect(position).toBe(1);
    });
  });
});
