import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { TwitchRepository } from './twitch-repository';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const mockDynamoDBClient = mockClient(DynamoDBDocumentClient);

describe('twitch-repository', () => {
  describe('getAppToken', () => {
    it('should return the app token if it exists', async () => {
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour in the future
      mockDynamoDBClient.on(GetCommand).resolves({
        Item: {
          access_token: 'access-token',
          expires_at: expires // 1 hour in the future
        }
      });

      const tokenResult = await TwitchRepository.getAppToken();
      expect(tokenResult).toBeDefined();

      const { accessToken, expiresAt } = tokenResult!;
      expect(accessToken).toBe('access-token');
      expect(expiresAt).toBe(expires);
    });

    // it('should return undefined if the app token does not exist', async () => {
    //   mockDynamoDBClient.on(GetCommand).resolves({});
    //   const tokenResult = await TwitchRepository.getAppToken();
    //   expect(tokenResult).toBeUndefined();
    // });
  });
  describe('saveAppToken', () => {});
});
