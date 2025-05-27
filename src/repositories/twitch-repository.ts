import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand
} from '@aws-sdk/lib-dynamodb';

export class TwitchRepository {
  private static logger = new Logger({ serviceName: 'shuffle-repository' });
  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  private static ddbClient = new DynamoDB({
    region: process.env.AWS_REGION
  });

  private static ddbDocClient = DynamoDBDocumentClient.from(
    TwitchRepository.ddbClient,
    {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      }
    }
  );

  public static async saveAppToken(accessToken: string, expiry: string) {
    const response = await this.ddbDocClient.send(
      new PutCommand({
        TableName: this.TABLE_NAME,
        Item: {
          pk: 'twitch',
          sk: 'appToken',
          access_token: accessToken,
          expires_at: expiry
        }
      })
    );

    this.logger.info(
      `Saved Twitch access token with response: ${JSON.stringify(response)}`
    );
  }

  public static async getAppToken() {
    const { Item } = await this.ddbDocClient.send(
      new GetCommand({
        TableName: this.TABLE_NAME,
        Key: {
          pk: 'twitch',
          sk: 'appToken'
        }
      })
    );

    if (!Item) {
      throw new Error('App token not found');
    }

    return {
      accessToken: Item.access_token,
      expiresAt: Item.expires_at
    };
  }
}
