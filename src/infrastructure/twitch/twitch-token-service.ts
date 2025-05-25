import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
const DYNAMODB_TABLE_NAME = process.env.TABLE_NAME!;

export class TwitchTokenService {
  private dynamoDBClient: DynamoDBClient;
  private tokenKey: string;

  constructor() {
    this.dynamoDBClient = new DynamoDBClient({});
    this.tokenKey = 'twitch_app_access_token';
  }

  async getStoredToken(): Promise<{
    token: string;
    expiration: number;
  } | null> {
    const getItemCommand = new GetItemCommand({
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        id: { S: this.tokenKey }
      }
    });

    const storedTokenResponse = await this.dynamoDBClient.send(getItemCommand);

    if (storedTokenResponse.Item) {
      return {
        token: storedTokenResponse.Item.token.S || '',
        expiration: parseInt(storedTokenResponse.Item.expiration.N || '0', 10)
      };
    }

    return null;
  }

  async storeToken(token: string, expiration: number): Promise<void> {
    const putItemCommand = new PutItemCommand({
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        id: { S: this.tokenKey },
        token: { S: token },
        expiration: { N: expiration.toString() }
      }
    });

    await this.dynamoDBClient.send(putItemCommand);
  }
}
