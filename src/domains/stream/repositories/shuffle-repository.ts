import { Shuffle } from '../../shuffle/models/shuffle';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb'; // ES6 import
import { Logger } from '@aws-lambda-powertools/logger';

export class ShuffleRepository {
  private static client = new DynamoDBClient({
    region: process.env.AWS_REGION
  });
  private static ddbDocClient = DynamoDBDocumentClient.from(
    ShuffleRepository.client
  );

  private static logger = new Logger({ serviceName: 'shuffle-repository' });

  private static readonly TABLE_NAME = process.env.STREAM_DATA_TABLE!;

  public static async getShuffle(streamDate: string): Promise<Shuffle | null> {
    // TODO Implement this method to retrieve the current shuffle from the database

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

    this.logger.info(`Item: ${JSON.stringify(Item)}`);

    if (!Item) {
      this.logger.info('No active shuffle found.');
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unmarshalledItem = Item as any; // Adjust the type as needed

    const shuffle = Shuffle.load(
      unmarshalledItem.streamId,
      new Date(unmarshalledItem.openedAt),
      unmarshalledItem.participants,
      unmarshalledItem.isOpen
    );

    console.log('Unmarshalled item:', unmarshalledItem);

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
          participants: shuffle.getAllParticipants(),
          previousWinners: shuffle.getPreviousWinners(),
          isOpen: shuffle.isOpen
        }
      })
    );

    this.logger.info(`Response: ${JSON.stringify(response)}`);
  }
}
