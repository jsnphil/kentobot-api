import { Logger } from '@aws-lambda-powertools/logger';
import {
  DynamoDB,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';

export class BumpRepository {
  private static ddbClient = new DynamoDB({
    region: process.env.AWS_REGION
  });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  private static logger = new Logger({ serviceName: 'bump-repository' });

  public static async updateUserBumpEligibility(
    user: string,
    bumpExpiration: string
  ): Promise<void> {
    try {
      const command = new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          pk: { S: 'bumpExpiration' },
          sk: { S: user },
          user: { S: user },
          bumpExpiration: { N: bumpExpiration }
        }
      });

      await this.ddbClient.send(command);
    } catch (error) {
      this.logger.error((error as Error).message);
      throw new Error('Error updating user bump cooldown');
    }
  }

  // TODO Need to create a new object
  public static async getUserBumpEligibility(
    user: string
  ): Promise<{ user: string; bumpExpiration: string } | undefined> {
    // Here you would typically interact with your user repository to get the bump cooldown
    // For this example, we'll just return 0 to simulate the cooldown

    try {
      const command = new GetItemCommand({
        TableName: this.TABLE_NAME,
        Key: {
          pk: { S: 'bumpExpiration' },
          sk: { S: user }
        }
      });

      const { Item } = await this.ddbClient.send(command);

      if (Item) {
        return {
          user: Item!.user!.S!,
          bumpExpiration: Item!.bumpExpiration!.N!
        };
      } else {
        return undefined;
      }
    } catch (error) {
      this.logger.error((error as Error).message);
      // TODO Throw a custom error here
      throw new Error('Error getting user bump cooldown');
    }
  }
}
