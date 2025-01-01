import { SongQueue } from './song-queue';
import { SongQueueItem, SongRequest } from './song-request';

describe('SongQueue', () => {
  describe('addSong', () => {
    it('Should add a song to the queue', () => {
      // Arrange
      const songQueue = new SongQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      // Act
      songQueue.addSong(songRequest);

      // Assert
      expect(songQueue.toArray()).toEqual([
        {
          position: 1,
          youtubeId: 'youtubeId',
          title: 'Song title',
          length: 100,
          requestedBy: 'user',
          isBumped: false,
          isShuffled: false,
          isShuffleEntered: false
        }
      ]);

      expect(songQueue.getLength()).toBe(1);
    });

    it('Should add a song to the end of the queue', () => {
      // Arrange
      const songQueue = new SongQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeID2',
        title: 'Song title 2',
        length: 100,
        requestedBy: 'user 2'
      };

      // Act
      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);

      // Assert
      expect(songQueue.toArray()).toEqual([
        {
          position: 1,
          youtubeId: 'youtubeId',
          title: 'Song title',
          length: 100,
          requestedBy: 'user',
          isBumped: false,
          isShuffled: false,
          isShuffleEntered: false
        },
        {
          position: 2,
          youtubeId: 'youtubeID2',
          title: 'Song title 2',
          length: 100,
          requestedBy: 'user 2',
          isBumped: false,
          isShuffled: false,
          isShuffleEntered: false
        }
      ]);

      expect(songQueue.getLength()).toBe(2);
    });
  });

  describe('removeSong', () => {
    it('Should remove a song from the queue', () => {
      // Arrange
      const songQueue = new SongQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act
      songQueue.removeSong('youtubeId');

      // Assert
      expect(songQueue.toArray()).toEqual([]);
      expect(songQueue.getLength()).toBe(0);
    });

    it('Should throw an error if the song is not in the queue', () => {
      // Arrange
      const songQueue = new SongQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act
      const removeSong = () => songQueue.removeSong('youtubeId2');

      // Assert
      expect(removeSong).rejects('Request not found in queue');
    });
  });
});
