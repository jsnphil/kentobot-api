import { Logger } from '@aws-lambda-powertools/logger';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { SongQueue } from '../song-queue';
import { SongQueueItem } from '../types/song-request';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-repository' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongQueueRepository {
  async getQueue(streamDate: string): Promise<SongQueueItem[]> {
    try {
      const { Item } = await dynamoDBClient.send(
        new GetItemCommand({
          TableName: table,
          Key: {
            pk: { S: 'songList' },
            sk: { S: `songQueue#${streamDate}` }
          }
        })
      );

      if (!(Item && Item.songlist.L)) {
        return [];
      }

      return Item.songlist.L.map((song) => JSON.parse(song.S!));
    } catch (error) {
      logger.error(`Failed to load the queue: ${error}`);
      throw new Error('Failed to load the queue');
    }
  }

  async saveQueue(queue: SongQueue) {
    try {
      const response = await dynamoDBClient.send(
        new PutItemCommand({
          TableName: table,
          Item: {
            pk: { S: 'songList' },
            sk: { S: `songQueue#${queue.getStreamDate()}` },
            songlist: {
              L: queue.toArray().map((song) => ({ S: JSON.stringify(song) }))
            },
            streamDate: { S: queue.getStreamDate() },
            ttl: { N: (Math.floor(Date.now() / 1000) + 43200).toString() }
          }
        })
      );

      logger.debug('Queue saved');
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
            sk: { S: `songQueue#${queue.getStreamDate()}` }
          }
        })
      );
    } catch (error) {
      logger.error(`Failed to delete the queue: ${error}`);
      throw new Error('Failed to delete the queue');
    }
  }
}
