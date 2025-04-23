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

    it('should return a shuffle if found', async () => {
      const openedAt = new Date();
      mockDynamoDB.on(GetCommand).resolves({
        Item: {
          pk: {
            S: 'shuffle'
          },
          sk: {
            S: 'streamDate#2025-20-04'
          },
          id: {
            S: '2025-20-04'
          },
          isOpen: {
            BOOL: true
          },
          openedAt: {
            S: openedAt.toISOString()
          },
          entries: {
            M: {}
          },
          previousWinners: {
            L: [
              {
                S: 'Vin'
              },
              {
                S: 'Kelsier'
              },
              {
                S: 'Kaladin'
              }
            ]
          },
          streamId: {
            S: '2025-20-04'
          }
        }
      });

      const shuffle = await ShuffleRepository.getShuffle('2023-10-01');

      console.log('Shuffle:', shuffle);

      expect(shuffle).toBeDefined();
      expect(shuffle?.isOpen).toBe(true);
      expect(shuffle?.getStreamId()).toBe('2025-20-04');
      expect(shuffle?.getOpenedAt()).toEqual(openedAt);
      expect(shuffle?.getPreviousWinners()).toEqual([
        'Vin',
        'Kelsier',
        'Kaladin'
      ]);
    });

    /*
    it('should return a shuffle if found', async () => {
      const mockGetCommand = jest.fn().mockResolvedValue({
        Item: {
          streamId: 'streamId',
          openedAt: new Date().toISOString(),
          entries: [],
          isOpen: true
        }
      });
      (DynamoDBDocumentClient.prototype.send as jest.Mock).mockImplementation(
        mockGetCommand
      );

      const result = await ShuffleRepository.getShuffle('2023-10-01');

      expect(result).not.toBeNull();
      expect(mockGetCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: ShuffleRepository.TABLE_NAME,
          Key: {
            pk: 'shuffle',
            sk: 'streamDate#2023-10-01'
          }
        })
      );
    });*/
  });
});
