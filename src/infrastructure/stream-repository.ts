import {
  DynamoDB,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { Stream } from '../domains/stream/models/stream';
import { Song } from '../domains/song/models/song';
import { SongQueue } from '../domains/song/models/song-queue';
import { Logger } from '@aws-lambda-powertools/logger';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class StreamRepository {
  private static ddbClient = new DynamoDB({
    region: process.env.AWS_REGION
  });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  private static logger = new Logger({ serviceName: 'stream-repository' });

  public static async loadStream(streamDate: string) {
    const params = {
      TableName: this.TABLE_NAME,
      Key: {
        pk: { S: 'stream' },
        sk: { S: `streamDate#${streamDate}` }
      }
    };

    console.log(params);

    this.logger.info(`Loading stream for date: ${streamDate}`);
    const command = new GetItemCommand(params);

    const { Item } = await this.ddbClient.send(command);

    if (!Item) {
      return undefined;
    }

    this.logger.info(JSON.stringify(Item));

    const songQueue = SongQueue.create();

    const unmarshalledItem = unmarshall(Item);
    console.log(JSON.stringify(unmarshalledItem, null, 2));

    // TODO How to load

    const songData = JSON.parse(Item.streamData.S!); // Deserialize stream data
    for (const song of songData) {
      const newSong = await Song.load(
        song.songId,
        song.requestedBy,
        song.title,
        song.status,
        song.duration
      );

      await songQueue.addSong(newSong);
    }

    return Stream.load(Item.streamDate.S!, songQueue);
  }

  // Save a stream
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
          }
        },
        ConditionExpression:
          'attribute_not_exists(pk) AND attribute_not_exists(sk)'
      });

      await this.ddbClient.send(command);
    } catch (err) {
      this.logger.error((err as Error).message);

      if ((err as Error).name === 'ConditionalCheckFailedException') {
        throw new Error('Stream already exists');
      } else {
        throw new Error('Error saving stream');
      }
    }
  }
}
