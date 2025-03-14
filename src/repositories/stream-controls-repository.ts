import { Logger } from '@aws-lambda-powertools/logger';
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
// const logger = new Logger({ serviceName: 'song-controls-repo' });

const table = process.env.STREAM_DATA_TABLE;

export class StreamControlsRepository {
  async getQueueStatus() {
    const { Item } = await dynamoDBClient.send(
      new GetItemCommand({
        TableName: table,
        Key: {
          pk: { S: 'streamControls' },
          sk: { S: 'songRequestControls' }
        },
        ProjectionExpression: 'queueStatue'
      })
    );

    return Item?.queueStatue?.S;
  }

  async toggleSongRequests(status: 'open' | 'closed') {
    await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          pk: { S: 'streamControls' },
          sk: { S: 'songRequestControls' }
        },
        UpdateExpression: 'SET queueStatue = :status',
        ExpressionAttributeValues: {
          ':status': { S: status }
        }
      })
    );
  }
}
