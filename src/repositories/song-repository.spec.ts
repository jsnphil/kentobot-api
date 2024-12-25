import { mockClient } from 'aws-sdk-client-mock';
import { SongRepository } from './song-repository';
import { SongInfo, SongPlay } from '../types/song-request';

import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  TransactionCanceledException,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';

import { Logger } from '@aws-lambda-powertools/logger';

jest.mock('@aws-lambda-powertools/logger');

const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('Song Repository', () => {
  let songRepository: SongRepository;

  beforeEach(() => {
    songRepository = new SongRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Song Exists', () => {
    it('should return true if the song exists', async () => {
      const songRepository = new SongRepository();
      const youtubeId = '123';

      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: {
          pk: { S: 'yt#123' },
          sk: { S: 'songInfo' }
        }
      });

      expect(songRepository.songExists(youtubeId)).resolves.toBe(true);
    });

    it('should return false if the song does not exist', async () => {
      const songRepository = new SongRepository();
      const youtubeId = '123';

      mockDynamoDBClient.on(GetItemCommand).resolves({});

      expect(songRepository.songExists(youtubeId)).resolves.toBe(false);
    });
  });

  describe('Save New Song', () => {
    it('should save a new song and song play', async () => {
      const song = {
        youtubeId: '123',
        title: 'Test Song',
        length: 300
      } as SongInfo;

      const songPlay = {
        date: new Date(),
        requestedBy: 'User1'
      } as SongPlay;

      mockDynamoDBClient.on(TransactWriteItemsCommand).resolves({});

      expect(
        songRepository.saveNewSong(song, songPlay)
      ).resolves.toBeUndefined();
    });
  });

  describe('Save New Song Play', () => {
    it('skip adding the info if it exists', async () => {
      const songPlay = {
        date: new Date(),
        requestedBy: 'User1'
      } as SongPlay;

      const exception = new TransactionCanceledException({
        $metadata: {},
        message:
          'Transaction cancelled, please refer cancellation reasons for specific reasons [ConditionalCheckFailed]',
        CancellationReasons: [
          {},
          {
            Code: 'ConditionalCheckFailed'
          }
        ]
      });

      mockDynamoDBClient.on(TransactWriteItemsCommand).rejects(exception);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await songRepository.saveNewSongPlay('123', songPlay);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Song play already exists, skipping...'
      );
    });

    it('should throw an error if the song play count update fails', async () => {
      const songPlay = {
        date: new Date(),
        requestedBy: 'User1'
      } as SongPlay;

      const exception = new TransactionCanceledException({
        $metadata: {},
        message:
          'Transaction cancelled, please refer cancellation reasons for specific reasons [ConditionalCheckFailed]',
        CancellationReasons: [
          {
            Code: 'ErrorCode',
            Message: 'Play count update failed'
          },
          {}
        ]
      });

      mockDynamoDBClient.on(TransactWriteItemsCommand).rejects(exception);

      await expect(
        songRepository.saveNewSongPlay('123', songPlay)
      ).rejects.toThrow('Error updating play count');
    });

    it('should throw an error if the song play information save fails', async () => {
      const songPlay = {
        date: new Date(),
        requestedBy: 'User1'
      } as SongPlay;

      const exception = new TransactionCanceledException({
        $metadata: {},
        message:
          'Transaction cancelled, please refer cancellation reasons for specific reasons [ConditionalCheckFailed]',
        CancellationReasons: [
          {},
          {
            Code: 'ErrorCode',
            Message: 'Play count update failed'
          }
        ]
      });

      mockDynamoDBClient.on(TransactWriteItemsCommand).rejects(exception);

      await expect(
        songRepository.saveNewSongPlay('123', songPlay)
      ).rejects.toThrow('Error adding song play');
    });
  });

  describe('Get All Songs', () => {
    it('should return all songs when there are no more items', async () => {
      const songs = [
        {
          song_title: { S: 'Song 1' },
          youtube_id: { S: 'yt1' },
          song_length: { N: '300' }
        },
        {
          song_title: { S: 'Song 2' },
          youtube_id: { S: 'yt2' },
          song_length: { N: '200' }
        }
      ];

      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: songs,
        LastEvaluatedKey: undefined
      });

      const result = await songRepository.getAllSongs();

      expect(result).toEqual([
        { title: 'Song 1', youtubeId: 'yt1', length: 300 },
        { title: 'Song 2', youtubeId: 'yt2', length: 200 }
      ]);
    });

    it('should return all songs when there are more items', async () => {
      const songsBatch1 = [
        {
          song_title: { S: 'Song 1' },
          youtube_id: { S: 'yt1' },
          song_length: { N: '300' }
        }
      ];

      const songsBatch2 = [
        {
          song_title: { S: 'Song 2' },
          youtube_id: { S: 'yt2' },
          song_length: { N: '200' }
        }
      ];

      const queryCommand = {
        TableName: process.env.STREAM_DATA_TABLE!,
        KeyConditionExpression:
          'gsi_pk1 = :gsi_pk1 AND begins_with(gsi_sk1, :gsi_sk1)',
        IndexName: 'gsi1',
        ExpressionAttributeValues: {
          ':gsi_pk1': { S: 'songRequest' },
          ':gsi_sk1': { S: 'songRequest' }
        }
      };

      mockDynamoDBClient.on(QueryCommand, queryCommand).resolves({
        Items: songsBatch1,
        LastEvaluatedKey: { pk: { S: 'lastKey' } }
      });

      mockDynamoDBClient
        .on(QueryCommand, {
          ...queryCommand,
          ExclusiveStartKey: { pk: { S: 'lastKey' } }
        })
        .resolves({
          Items: songsBatch2,
          LastEvaluatedKey: undefined
        });

      const result = await songRepository.getAllSongs();

      expect(result).toMatchObject([
        { title: 'Song 1', youtubeId: 'yt1', length: 300 },
        { title: 'Song 2', youtubeId: 'yt2', length: 200 }
      ]);
    });

    it('should return an empty array when there are no songs', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [],
        LastEvaluatedKey: undefined
      });

      const result = await songRepository.getAllSongs();

      expect(result).toEqual([]);
    });
  });

  describe('Get Song Info', () => {
    it('should return song info when the song exists', async () => {
      const youtubeId = '123';

      const songInfo = {
        pk: { S: 'yt#123' },
        sk: { S: 'songInfo' },
        song_title: { S: 'Test Song' },
        song_length: { N: '300' },
        play_count: { N: '1' },
        youtube_id: { S: '123' }
      };

      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: songInfo
      });

      const result = await songRepository.getSongInfo(youtubeId);

      expect(result).toEqual({
        youtubeId: '123',
        title: 'Test Song',
        length: 300,
        playCount: 1
      });
    });

    it('should return undefined when the song does not exist', async () => {
      const youtubeId = '123';

      mockDynamoDBClient.on(GetItemCommand).resolves({});

      const result = await songRepository.getSongInfo(youtubeId);

      expect(result).toBeUndefined();
    });
  });
});
