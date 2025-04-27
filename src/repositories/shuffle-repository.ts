import { Shuffle } from '@domains/shuffle/models/shuffle';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { ShuffleEntry } from '@domains/shuffle/models/shuffle-entry';

export class ShuffleRepository {
  private static client = new DynamoDBClient({
    region: process.env.AWS_REGION
  });
  private static ddbDocClient = DynamoDBDocumentClient.from(
    ShuffleRepository.client,
    {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      }
    }
  );

  private static logger = new Logger({ serviceName: 'shuffle-repository' });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  public static async getShuffle(streamDate: string): Promise<Shuffle | null> {
    this.logger.info('Retrieving current shuffle...');

    const { Item } = await this.ddbDocClient.send(
      new GetCommand({
        TableName: this.TABLE_NAME,
        Key: {
          pk: 'shuffle',
          sk: `streamDate#${streamDate}`
        }
      })
    );

    this.logger.debug(`Item: ${JSON.stringify(Item)}`);

    if (!Item) {
      this.logger.info('No active shuffle found.');
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unmarshalledItem = Item as any; // Adjust the type as needed

    console.log('Unmarshalled Item:', unmarshalledItem);

    let entries: ShuffleEntry[];

    if (unmarshalledItem.entries) {
      entries = unmarshalledItem.entries.map((entry: any) => {
        return new ShuffleEntry(entry.user, entry.songId);
      });
    } else {
      entries = [];
    }

    const cooldowns: Map<string, number> = new Map<string, number>();
    if (unmarshalledItem.winnerCooldowns) {
      console.log('Unmarshalling winner cooldowns...');

      unmarshalledItem.winnerCooldowns.forEach((value: number, key: string) => {
        cooldowns.set(key, value as number);
      });

      console.log(Object.entries(unmarshalledItem.winnerCooldowns));
      for (const [key, value] of Object.entries(
        unmarshalledItem.winnerCooldowns
      )) {
        console.log(`Key: ${key}, Value: ${value}`);
        cooldowns.set(key, value as number);
      }
    }

    const shuffle = Shuffle.load(
      unmarshalledItem.streamId,
      new Date(unmarshalledItem.openedAt),
      entries,
      unmarshalledItem.isOpen,
      cooldowns
    );

    console.log('Loaded Shuffle:', shuffle);

    return shuffle;
  }

  public static async save(shuffle: Shuffle): Promise<void> {
    this.logger.info(`Saving shuffle: ${JSON.stringify(shuffle)}`);
    const response = await this.ddbDocClient.send(
      new PutCommand({
        TableName: this.TABLE_NAME,
        Item: {
          pk: 'shuffle',
          sk: `streamDate#${shuffle.getStreamId()}`,
          id: '1',
          streamId: shuffle.getStreamId(),
          openedAt: shuffle.getOpenedAt().toISOString(),
          entries: shuffle.getEntries(),
          winnerCooldowns: shuffle.getCooldowns(),
          isOpen: shuffle.isOpen
        }
      })
    );

    this.logger.info(`Response: ${JSON.stringify(response)}`);
  }
}
