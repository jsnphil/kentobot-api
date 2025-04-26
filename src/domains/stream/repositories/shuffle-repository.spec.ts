import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ShuffleRepository } from './shuffle-repository';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const mockDynamoDB = mockClient(DynamoDBDocumentClient);

describe('shuffle-repository', () => {
  describe('getShuffle', () => {
    it('should return null if no active shuffle is found', async () => {
      mockDynamoDB.on(GetCommand).resolves({
        Item: undefined
      });

      const result = await ShuffleRepository.getShuffle('2023-10-01');
      expect(result).toBeNull();
    });

    it('should return a shuffle with entries if found', async () => {
      const openedAt = new Date();

      mockDynamoDB.on(GetCommand).resolves({
        Item: {
          isOpen: true,
          sk: 'streamDate#2025-24-04',
          openedAt: openedAt.toISOString(),
          previousWinners: ['Vin', 'Kelsier', 'Kaladin'],
          entries: [{ user: 'Jasnah', songId: 'USGMvV1O-IE' }],
          pk: 'shuffle',
          id: '1',
          streamId: '2025-24-04'
        }
      });

      const shuffle = await ShuffleRepository.getShuffle('2023-10-01');

      console.log('Shuffle:', shuffle);

      expect(shuffle).toBeDefined();
      expect(shuffle?.isOpen).toBe(true);
      expect(shuffle?.getStreamId()).toBe('2025-24-04');
      expect(shuffle?.getOpenedAt()).toEqual(openedAt);
      expect(shuffle?.getPreviousWinners()).toEqual([
        'Vin',
        'Kelsier',
        'Kaladin'
      ]);
      expect(shuffle?.getEntries()).toEqual([
        {
          user: 'Jasnah',
          songId: 'USGMvV1O-IE'
        }
      ]);
    });

    it('should return a shuffle without entries if found', async () => {
      const openedAt = new Date();

      mockDynamoDB.on(GetCommand).resolves({
        Item: {
          isOpen: true,
          sk: 'streamDate#2025-24-04',
          openedAt: openedAt.toISOString(),
          previousWinners: ['Vin', 'Kelsier', 'Kaladin'],
          pk: 'shuffle',
          id: '1',
          streamId: '2025-24-04'
        }
      });

      const shuffle = await ShuffleRepository.getShuffle('2023-10-01');

      console.log('Shuffle:', shuffle);

      expect(shuffle).toBeDefined();
      expect(shuffle?.isOpen).toBe(true);
      expect(shuffle?.getStreamId()).toBe('2025-24-04');
      expect(shuffle?.getOpenedAt()).toEqual(openedAt);
      expect(shuffle?.getPreviousWinners()).toEqual([
        'Vin',
        'Kelsier',
        'Kaladin'
      ]);
      expect(shuffle?.getEntries()).toEqual([]);
    });
  });
});
