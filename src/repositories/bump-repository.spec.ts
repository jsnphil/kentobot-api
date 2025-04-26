import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { BumpRepository } from './bump-repository';
import { mockClient } from 'aws-sdk-client-mock';

jest.mock('@aws-lambda-powertools/logger');

const mockDynamoDB = mockClient(DynamoDBClient);

describe('BumpRepository', () => {
  const mockLogger = Logger as jest.MockedClass<typeof Logger>;

  beforeEach(() => {
    mockLogger.prototype.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserBumpEligibility', () => {
    // it('should update user bump eligibility successfully', async () => {
    //   const user = 'testUser';
    //   const bumpExpiration = '1234567890';

    //   await BumpRepository.updateUserBumpEligibility(user, bumpExpiration);

    //   expect(mockDynamoDBClient.prototype.send).toHaveBeenCalledWith(
    //     expect.any(PutItemCommand)
    //   );
    // });

    it('should throw an error if update fails', async () => {
      const user = 'Kaladin';
      const bumpExpiration = '1234567890';
      const errorMessage = 'DynamoDB error';

      mockDynamoDB.on(PutItemCommand).rejects(new Error(errorMessage));

      await expect(
        BumpRepository.updateUserBumpEligibility(user, bumpExpiration)
      ).rejects.toThrow('Error updating user bump cooldown');
    });
  });

  describe('getUserBumpEligibility', () => {
    it('should return user bump eligibility if found', async () => {
      const user = 'Vin';
      const bumpExpiration = '1234567890';

      mockDynamoDB.on(GetItemCommand).resolves({
        Item: {
          pk: { S: 'bumpExpiration' },
          sk: { S: user },
          user: { S: user },
          bumpExpiration: { N: bumpExpiration }
        }
      });

      const result = await BumpRepository.getUserBumpEligibility(user);

      expect(result).toEqual({ user, bumpExpiration });
    });

    it('should return undefined if user bump eligibility not found', async () => {
      const user = 'testUser';

      mockDynamoDB.on(GetItemCommand).resolves({
        Item: undefined
      });

      const result = await BumpRepository.getUserBumpEligibility(user);

      expect(result).toBeUndefined();
    });

    it('throw an error if get fails', async () => {
      const user = 'testUser';
      const errorMessage = 'DynamoDB error';

      mockDynamoDB.on(GetItemCommand).rejects(new Error(errorMessage));

      await expect(BumpRepository.getUserBumpEligibility(user)).rejects.toThrow(
        'Error getting user bump cooldown'
      );
    });
  });
});
