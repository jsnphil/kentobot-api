// src/domains/twitch/infra/twitch-token-store.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb';
import { skip } from 'node:test';

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
        Key: { pk: 'twitch', sk: 'appToken' }
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
          pk: 'twitch',
          sk: 'appToken',
          accessToken: token.accessToken,
          expiresAt
        }
      })
    );
  }
}
