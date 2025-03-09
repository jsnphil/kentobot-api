import {
  DynamoDB,
  GetItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { Stream } from '../domains/stream/models/stream';
import { Song } from '../domains/song/models/song';
import { SongQueue } from '../domains/song/models/song-queue';

export class StreamRepository {
  private static ddbClient = new DynamoDB({
    region: process.env.AWS_REGION
  });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  public static async loadStream(streamDate: string) {
    const command = new GetItemCommand({
      TableName: this.TABLE_NAME,
      Key: {
        pk: { S: 'stream' },
        sk: { S: `streamDate${streamDate}` }
      }
    });

    const result = await this.ddbClient.send(command);

    if (!result.Item) {
      return undefined;
    }

    const songQueue = SongQueue.create();

    const songData = JSON.parse(result.Item.streamData.S!); // Deserialize stream data
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

    return Stream.create(new Date(result.Item.streamDate.S!), songQueue);
  }

  // Save a stream
  public static async saveStream(
    streamDate: string,
    streamData: any
  ): Promise<void> {
    const command = new PutItemCommand({
      TableName: this.TABLE_NAME,
      Item: {
        pk: { S: 'stream' },
        sk: { S: `streamDate${streamDate}` },
        streamId: { S: 'stream' },
        streamDate: { S: `streamDate${streamDate}` },
        streamData: { S: JSON.stringify(streamData) } // TODO Break this into more attributes
      }
    });

    await this.ddbClient.send(command);
  }
}
