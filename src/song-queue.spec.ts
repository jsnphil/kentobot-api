import { SongQueue } from './song-queue';
import { SongRequest } from './types/song-request';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const mockDynamoDBClient = mockClient(DynamoDBClient);

// TODO Can the test be refactored to use a beforeEach to setup the queue

describe('SongQueue', () => {
  describe('addSong', () => {
    it('Should add a song to the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

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

    it('Should add a song to the end of the queue', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

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
          youtubeId: 'youtubeId',
          title: 'Song title',
          length: 100,
          requestedBy: 'user',
          isBumped: false,
          isShuffled: false,
          isShuffleEntered: false
        },
        {
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
    it('Should remove a song from the start of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      songQueue.removeSong('youtubeId1');

      // Assert

      expect(songQueue.getLength()).toBe(2);
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId2');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId3');
    });

    it('Should remove a song from the end of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      songQueue.removeSong('youtubeId3');

      // Assert

      expect(songQueue.getLength()).toBe(2);
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId1');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId2');
    });

    it('Should remove a song from the middle of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      songQueue.removeSong('youtubeId2');

      // Assert
      expect(songQueue.getLength()).toBe(2);
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId1');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId3');
    });

    it('Should throw an error if the song is not in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act

      // Assert
      expect(() => songQueue.removeSong('youtubeId2')).toThrow(
        'Request not found in queue'
      );
    });

    it('Should throw an error if the queue is empty', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      expect(() => songQueue.removeSong('youtubeId2')).toThrow(
        'Queue is empty'
      );
    });
  });

  describe('removeSongForUser', () => {
    it('Should remove a song the user if they have a song in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      songQueue.removeSongForUser('user2');

      // Assert

      expect(songQueue.getLength()).toBe(2);
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId1');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId3');
    });

    it('Should throw an error if the user does not have a song in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Assert
      expect(() => songQueue.removeSongForUser('user4')).toThrow(
        'User does not have a song in the queue'
      );
    });
  });

  describe('findSongById', () => {
    it('Should return the song if it is in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      const result = songQueue.findSongById('youtubeId2');

      // Assert
      expect(result?.youtubeId).toEqual('youtubeId2');
    });

    it('Should return undefined if the song is not in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act
      const result = songQueue.findSongById('youtubeId2');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findSongByUser', () => {
    it('Should return the song if the user has a song in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);

      // Act
      const result = songQueue.findSongByUser('user2');

      // Assert
      expect(result?.youtubeId).toEqual('youtubeId2');
    });

    it('Should return undefined if the user does not have a song in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act
      const result = songQueue.findSongByUser('user2');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('moveSong', () => {
    it('Should move a song to the top of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest4: SongRequest = {
        youtubeId: 'youtubeId4',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);
      songQueue.addSong(songRequest4);
      songQueue.addSong(songRequest5);

      // Act
      songQueue.moveSong('youtubeId5', 1);

      // Assert
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId5');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId1');
      expect(songQueue.toArray()[2].youtubeId).toEqual('youtubeId2');
      expect(songQueue.toArray()[3].youtubeId).toEqual('youtubeId3');
      expect(songQueue.toArray()[4].youtubeId).toEqual('youtubeId4');
    });

    it('Should move a song to the bottom of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest4: SongRequest = {
        youtubeId: 'youtubeId4',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);
      songQueue.addSong(songRequest4);
      songQueue.addSong(songRequest5);

      // Act
      songQueue.moveSong('youtubeId1', 5);

      // Assert
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId2');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId3');
      expect(songQueue.toArray()[2].youtubeId).toEqual('youtubeId4');
      expect(songQueue.toArray()[3].youtubeId).toEqual('youtubeId5');
      expect(songQueue.toArray()[4].youtubeId).toEqual('youtubeId1');
    });

    it('Should move a song in the middle of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest1: SongRequest = {
        youtubeId: 'youtubeId1',
        title: 'Song title',
        length: 100,
        requestedBy: 'user1'
      };

      const songRequest2: SongRequest = {
        youtubeId: 'youtubeId2',
        title: 'Song title',
        length: 100,
        requestedBy: 'user2'
      };

      const songRequest3: SongRequest = {
        youtubeId: 'youtubeId3',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest4: SongRequest = {
        youtubeId: 'youtubeId4',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user3'
      };

      songQueue.addSong(songRequest1);
      songQueue.addSong(songRequest2);
      songQueue.addSong(songRequest3);
      songQueue.addSong(songRequest4);
      songQueue.addSong(songRequest5);

      // Act
      songQueue.moveSong('youtubeId4', 2);

      // Assert
      expect(songQueue.toArray()[0].youtubeId).toEqual('youtubeId1');
      expect(songQueue.toArray()[1].youtubeId).toEqual('youtubeId4');
      expect(songQueue.toArray()[2].youtubeId).toEqual('youtubeId2');
      expect(songQueue.toArray()[3].youtubeId).toEqual('youtubeId3');
      expect(songQueue.toArray()[4].youtubeId).toEqual('youtubeId5');
    });

    it('Should throw an error if the song is not in the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      songQueue.addSong(songRequest);

      // Act

      // Assert
      expect(() => songQueue.moveSong('youtubeId2', 1)).toThrow(
        'Request not found in queue'
      );
    });

    it('Should throw an error if the queue is empty', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });
      const songQueue = await SongQueue.loadQueue();

      expect(
        async () => await songQueue.moveSong('youtubeId2', 1)
      ).rejects.toThrow('Queue is empty');
    });
  });
});
