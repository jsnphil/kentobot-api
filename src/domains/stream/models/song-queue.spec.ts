import { SongQueue } from './song-queue';
import { Song } from './song';

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
      status: 'in queue'
    };
    song2 = {
      id: '2',
      title: 'Song 2',
      requestedBy: 'Kelsier',
      duration: 300,
      status: 'in queue'
    };
    song3 = {
      id: '3',
      title: 'Song 3',
      requestedBy: 'Elend',
      duration: 300,
      status: 'in queue'
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

    it('should throw an error if the song already exists in the queue', async () => {
      await songQueue.addSong(song1);
      await expect(songQueue.addSong(song1)).rejects.toThrow(
        'Song already exists in the queue'
      );
    });

    it('should throw an error if the user already has a song in the queue', async () => {
      await songQueue.addSong(song1);

      const song = Song.load('songId', 'Vin', 'Song 4', 'in queue', 300);
      await expect(songQueue.addSong(song)).rejects.toThrow(
        'User already has a song in the queue'
      );
    });
  });

  describe('removeSong', () => {
    it('should remove a song from the queue', async () => {
      await songQueue.addSong(song1);
      await songQueue.removeSong(song1.id);
      expect(songQueue.getSongQueue()).not.toContain(song1);
      //   expect(EventPublisher.publishEvent).toHaveBeenCalledWith(
      //     new SongRemovedFromQueue(song1.id),
      //     'song-removed-from-queue'
      //   );
    });

    it('should throw an error if the queue is empty', async () => {
      await expect(songQueue.removeSong(song1.id)).rejects.toThrow(
        'Queue is empty'
      );
    });

    it('should throw an error if the song is not found in the queue', async () => {
      await songQueue.addSong(song1);
      await expect(songQueue.removeSong('non-existent-id')).rejects.toThrow(
        'Request not found in queue'
      );
    });
  });

  describe('getSongQueue', () => {
    it('should return the current song queue', async () => {
      await songQueue.addSong(song1);
      await songQueue.addSong(song2);
      expect(songQueue.getSongQueue()).toEqual([song1, song2]);
    });

    it('should return an empty array if the queue is empty', () => {
      expect(songQueue.getSongQueue()).toEqual([]);
    });
  });
});
