import { StreamRepository } from './stream-repository';
import { Stream } from '../domains/stream/models/stream';
import { Logger } from '@aws-lambda-powertools/logger';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

jest.mock('../domains/stream/models/stream');
jest.mock('../domains/song/models/song');
jest.mock('../domains/song/models/song-queue');
jest.mock('@aws-lambda-powertools/logger');

const mockDynamoDB = mockClient(DynamoDBClient);

describe('StreamRepository', () => {
  const mockLogger = Logger as jest.MockedClass<typeof Logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    process.env.STREAM_DATA_TABLE = 'StreamDataTable';
  });

  describe('loadStream', () => {
    // it('should load a stream successfully', async () => {
    //   mockDynamoDB.on(GetItemCommand).resolves({
    //     Item: {
    //       pk: { S: 'stream' },
    //       sk: { S: 'streamDate2023-01-01' },
    //       streamDate: { S: '2023-01-01T00:00:00.000Z' },
    //       streamData: { S: 'streamData' }
    //     }
    //   });

    //   const result = await StreamRepository.loadStream('2023-01-01');

    //   expect(result).toBeDefined();
    //   expect(result?.getStreamDate()).toEqual(
    //     new Date('2023-01-01T00:00:00.000Z')
    //   );

    //   expect(result?.getSongQueue()).toBeDefined();
    // });

    it('should return undefined if stream not found', async () => {
      mockDynamoDB.on(GetItemCommand).resolves({
        Item: undefined
      });

      const result = await StreamRepository.loadStream('2023-01-01');
      expect(result).toBeUndefined();
    });
  });

  describe('saveStream', () => {
    // it('should save a stream successfully', async () => {
    //   const mockStream = {
    //     getStreamDate: jest.fn().mockReturnValue('2023-01-01')
    //   };

    //   mockDynamoDB.on(PutItemCommand).resolves({});

    //   await StreamRepository.saveStream(mockStream as unknown as Stream);
    // });

    it('should throw an error if there is an error saving the stream', async () => {
      mockDynamoDB.on(PutItemCommand).rejects(new Error('Some error'));

      const mockStream = {
        getStreamDate: jest.fn().mockReturnValue('2023-01-01')
      };

      await expect(
        StreamRepository.saveStream(mockStream as unknown as Stream)
      ).rejects.toThrow('Error saving stream');
    });
  });
});
