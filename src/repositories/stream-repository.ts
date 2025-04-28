import {
  DynamoDB,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { Stream } from '@domains/stream/models/stream';

import { Logger } from '@aws-lambda-powertools/logger';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class StreamRepository {
  private static ddbClient = new DynamoDB({
    region: process.env.AWS_REGION
  });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  private static logger = new Logger({ serviceName: 'stream-repository' });

  public static async loadStream(streamDate: string) {
    this.logger.info(`Loading stream for date: ${streamDate}`);
    const command = new GetItemCommand({
      TableName: this.TABLE_NAME,
      Key: {
        pk: { S: 'stream' },
        sk: { S: `streamDate#${streamDate}` }
      }
    });

    const { Item } = await this.ddbClient.send(command);

    this.logger.info(`Item: ${JSON.stringify(Item)}`);

    if (!Item) {
      return undefined;
    } else {
      const unmarshalledItem = unmarshall(Item);

      return {
        ...unmarshalledItem,
        songQueue: JSON.parse(unmarshalledItem.songQueue),
        songHistory: JSON.parse(unmarshalledItem.songHistory)
      };
    }
  }

  // Save a stream
  // TODO Rename to just save
  public static async saveStream(stream: Stream): Promise<void> {
    try {
      const command = new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          pk: { S: 'stream' },
          sk: { S: `streamDate#${stream.getStreamDate()}` },
          streamId: { S: 'stream' },
          streamDate: {
            S: stream.getStreamDate()
          },
          songQueue: {
            S: JSON.stringify(stream.getSongQueue())
          },
          songHistory: {
            S: JSON.stringify(stream.getSongHistory())
          },
          beanBumpsAvailable: {
            N: stream.getAvailableBeanBumps().toString()
          },
          channelPointBumpsAvailable: {
            N: stream.getAvailableChannelPointBumps().toString()
          }
        }
      });

      await this.ddbClient.send(command);
    } catch (err) {
      this.logger.error((err as Error).message);
      throw new Error('Error saving stream');
    }
  }
}
