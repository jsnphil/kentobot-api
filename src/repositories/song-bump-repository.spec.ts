import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { SongBumpRepository } from './song-bump-repository';
import { mockClient } from 'aws-sdk-client-mock';

const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('song-bump-repository', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should get bump data', async () => {
    const songBumpRepository = new SongBumpRepository();

    mockDynamoDBClient.on(QueryCommand).resolves({
      Items: [
        {
          pk: { S: 'bumpData' },
          sk: { S: 'bumpData' },
          bumpsAvailable: { N: '3' }
        },
        {
          pk: { S: 'bumpData' },
          sk: { S: 'user#user1' },
          bumpedUser: { S: 'user1' },
          expiresAt: { N: '1640995200' },
          ttl: { N: '1640995200' }
        },
        {
          pk: { S: 'bumpData' },
          sk: { S: 'user#user2' },
          bumpedUser: { S: 'user2' },
          expiresAt: { N: '1640995200' },
          ttl: { N: '1640995200' }
        }
      ]
    });

    const result = await songBumpRepository.getBumpData();

    expect(result.bumpsAvailable).toBe(3);
    expect(result.bumpedUsers.length).toBe(2);
    expect(result.bumpedUsers).toEqual(['user1', 'user2']);
  });

  it('should return 0 bumps available and no users if no bump data is found', async () => {
    const songBumpRepository = new SongBumpRepository();

    mockDynamoDBClient.on(QueryCommand).resolves({
      Items: []
    });

    const result = await songBumpRepository.getBumpData();

    expect(result.bumpsAvailable).toBe(0);
    expect(result.bumpedUsers.length).toBe(0);
  });
});
