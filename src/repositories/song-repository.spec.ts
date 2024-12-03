import { mockClient } from 'aws-sdk-client-mock';
import { SongRepository } from './SongRepository';
import { SongInfo, SongPlay } from '../types/song-request';

import {
  DynamoDBClient,
  GetItemCommand,
  TransactionCanceledException,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';

import { Logger } from '@aws-lambda-powertools/logger';

jest.mock('@aws-lambda-powertools/logger');

const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('Song Repository', () => {
  let logger: Logger;
  let songRepository: SongRepository;

  beforeEach(() => {
    logger = new Logger({
      serviceName: 'song-repository'
    });

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
      const loggerSpy = jest.spyOn(logger, 'warn');

      await songRepository.saveNewSongPlay('123', songPlay);

      expect(logger.warn).toHaveBeenCalledWith(
        'Song play already exists, skipping...'
      );
    });
  });
});
