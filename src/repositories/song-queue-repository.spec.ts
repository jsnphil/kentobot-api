import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { SongQueueRepository } from './song-queue-repository';
const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('SongQueueRepository', () => {
  let songQueueRepository: SongQueueRepository;

  beforeEach(() => {
    songQueueRepository = new SongQueueRepository();
  });

  describe('getQueue', () => {
    it('should return an empty array if there is no queue in the database', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      expect(await songQueueRepository.getQueue('2022-01-01')).toEqual([]);
    });

    it('should return an empty array if there is no list in the queue item', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: {
          songlist: { S: 'songList' }
        }
      });

      expect(await songQueueRepository.getQueue('2022-01-01')).toEqual([]);
    });

    it('should return the queue from the database', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: {
          songlist: {
            L: [
              { S: JSON.stringify({ youtubeId: 'youtubeId1' }) },
              { S: JSON.stringify({ youtubeId: 'youtubeId2' }) }
            ]
          }
        }
      });

      expect(await songQueueRepository.getQueue('2022-01-01')).toEqual([
        { youtubeId: 'youtubeId1' },
        { youtubeId: 'youtubeId2' }
      ]);
    });

    it('should throw an error if the database lookup fails', async () => {
      mockDynamoDBClient
        .on(GetItemCommand)
        .rejects(new Error('Something broke!'));

      await expect(() =>
        songQueueRepository.getQueue('2022-01-01')
      ).rejects.toThrow('Failed to load the queue');
    });
  });

  describe('saveQueue', () => {
    it('should throw an error if the database save fails', async () => {
      mockDynamoDBClient
        .on(PutItemCommand)
        .rejects(new Error('Something broke!'));

      expect(() => songQueueRepository.saveQueue({} as any)).rejects.toThrow(
        'Failed to save the queue'
      );
    });
  });

  describe('deleteQueue', () => {
    it('should throw an error if the database delete fails', async () => {
      mockDynamoDBClient
        .on(DeleteItemCommand)
        .rejects(new Error('Something broke!'));

      expect(() => songQueueRepository.deleteQueue({} as any)).rejects.toThrow(
        'Failed to delete the queue'
      );
    });
  });
});
