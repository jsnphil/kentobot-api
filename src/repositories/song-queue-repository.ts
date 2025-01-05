import { Logger } from '@aws-lambda-powertools/logger';
import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { SongQueue } from '../song-queue';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-repository' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongQueueRepository {
  async getQueue(streamDate: Date): Promise<SongQueue | undefined> {
    try {
        const { Item } = await dynamoDBClient.send(new GetItemCommand({
            TableName: table,
            Key: {
                pk: { S: 'songList' },
                sk: { S: `songQueue#${streamDate.toISOString()}` }
            }
        }));
        });
    } catch (error) {
      logger.error(`Failed to load the queue: ${error}`);
      throw new Error('Failed to load the queue');
    }
  }

  async saveQueue(queue: SongQueue) {
    try {
      await dynamoDBClient.send(
        new PutItemCommand({
          TableName: table,
          Item: {
            pk: { S: 'songList' },
            sk: { S: `songQueue#${queue.getStreamDate().toISOString()}` },
            songlist: {
              L: queue.toArray().map((song) => ({ S: JSON.stringify(song) }))
            },
            streamDate: { S: queue.getStreamDate().toISOString() },
            ttl: { N: (Math.floor(Date.now() / 1000) + 43200).toString() }
          }
        })
      );
    } catch (error) {
      logger.error(`Failed to save the queue: ${error}`);
      throw new Error('Failed to save the queue');
    }
  }

  async deleteQueue(queue: SongQueue) {
    try {
      await dynamoDBClient.send(
        new DeleteItemCommand({
          TableName: table,
          Key: {
            pk: { S: 'songList' },
            sk: { S: `songQueue#${queue.getStreamDate().toISOString()}` }
          }
        })
      );
    } catch (error) {
      logger.error(`Failed to delete the queue: ${error}`);
      throw new Error('Failed to delete the queue');
    }
  }
}
