import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import fetch from 'node-fetch';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const DYNAMODB_TABLE_NAME = process.env.TABLE_NAME!;

class TwitchTokenService {
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

class TwitchAPIService {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async fetchNewToken(): Promise<{ token: string; expiresIn: number }> {
    const url = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch access token from Twitch API');
    }

    const data = await response.json();
    return {
      token: data.access_token,
      expiresIn: data.expires_in
    };
  }
}

export async function getAccessToken(): Promise<string> {
  const twitchTokenService = new TwitchTokenService();
  const twitchAPIService = new TwitchAPIService(
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET
  );

  const storedToken = await twitchTokenService.getStoredToken();

  if (storedToken && Date.now() < storedToken.expiration) {
    return storedToken.token;
  }

  const { token, expiresIn } = await twitchAPIService.fetchNewToken();
  const expirationTime = Date.now() + expiresIn * 1000;

  await twitchTokenService.storeToken(token, expirationTime);

  return token;
}
