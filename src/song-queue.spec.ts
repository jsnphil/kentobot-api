import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { SongQueue } from './song-queue';
import { SongRequest } from './types/song-request';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const mockDynamoDBClient = mockClient(DynamoDBClient);
const mockSSMClient = mockClient(SSMClient);

// TODO Can the test be refactored to use a beforeEach to setup the queue

describe('SongQueue', () => {
  beforeEach(() => {
    process.env.REQUEST_DURATION_NAME = 'REQUEST_DURATION_NAME';
    process.env.MAX_SONGS_PER_USER = 'MAX_SONGS_PER_USER';
  });

  describe('addSong', () => {
    it('Should add a song to the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      // Act
      await songQueue.addSong(songRequest);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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
      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);

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

    it('should throw an error if the song is already in the queue', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);
      const addSongResult = await songQueue.addSong({
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'a-different-user'
      });

      expect(addSongResult.songAdded).toBe(false);
      expect(addSongResult.failedRule).toBe('Song is already in the queue');
    });

    it('should not add the song if the requester already has a song in the queue', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);

      const addSongResult = await songQueue.addSong({
        youtubeId: 'youtubeId2',
        title: 'Song title 2',
        length: 100,
        requestedBy: 'user'
      });

      expect(addSongResult.songAdded).toBe(false);
      expect(addSongResult.failedRule).toBe(
        'User already has 1 song(s) in the queue'
      );
    });

    it('should add to the queue if the user already has a song in the queue and the override is set', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);
      await songQueue.addSong({
        youtubeId: 'youtubeId2',
        title: 'Song title 2',
        length: 100,
        requestedBy: 'user',
        allowOverride: true
      });

      expect(songQueue.getLength()).toBe(2);
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
          youtubeId: 'youtubeId2',
          title: 'Song title 2',
          length: 100,
          requestedBy: 'user',
          isBumped: false,
          isShuffled: false,
          isShuffleEntered: false
        }
      ]);
    });

    it('should not add the song if the song is too long', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const addSongResult = await songQueue.addSong({
        youtubeId: 'youtubeId2',
        title: 'Song title 2',
        length: 400,
        requestedBy: 'user'
      });

      expect(addSongResult.songAdded).toBe(false);
      expect(addSongResult.failedRule).toBe('Song length must be under 6:00');
    });
  });

  describe('removeSong', () => {
    it('Should remove a song from the start of the queue', async () => {
      // Arrange
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });
      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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
        requestedBy: 'user4'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user5'
      };

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);
      await songQueue.addSong(songRequest4);
      await songQueue.addSong(songRequest5);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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
        requestedBy: 'user4'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user5'
      };

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);
      await songQueue.addSong(songRequest4);
      await songQueue.addSong(songRequest5);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

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
        requestedBy: 'user4'
      };

      const songRequest5: SongRequest = {
        youtubeId: 'youtubeId5',
        title: 'Song title',
        length: 100,
        requestedBy: 'user5'
      };

      await songQueue.addSong(songRequest1);
      await songQueue.addSong(songRequest2);
      await songQueue.addSong(songRequest3);
      await songQueue.addSong(songRequest4);
      await songQueue.addSong(songRequest5);

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

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'REQUEST_DURATION_NAME'
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      mockSSMClient
        .on(GetParameterCommand, {
          Name: 'MAX_SONGS_PER_USER'
        })
        .resolves({ Parameter: { Value: '1' } });

      const songQueue = await SongQueue.loadQueue();

      const songRequest: SongRequest = {
        youtubeId: 'youtubeId',
        title: 'Song title',
        length: 100,
        requestedBy: 'user'
      };

      await songQueue.addSong(songRequest);

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
