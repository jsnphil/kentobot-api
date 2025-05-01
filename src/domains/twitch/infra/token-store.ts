// src/domains/twitch/infra/twitch-token-store.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME;

export type AppTokenRecord = {
  tokenType: 'app';
  accessToken: string;
  expiresAt: number; // epoch ms
};

export class TwitchTokenStore {
  private docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  async loadAppToken(): Promise<AppTokenRecord | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { tokenType: 'app' }
      })
    );
    return (result.Item as AppTokenRecord) ?? null;
  }

  async saveAppToken(token: {
    accessToken: string;
    expiresIn: number;
  }): Promise<void> {
    const expiresAt = Date.now() + token.expiresIn * 1000;

    await this.docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          tokenType: 'app',
          accessToken: token.accessToken,
          expiresAt
        }
      })
    );
  }
}
