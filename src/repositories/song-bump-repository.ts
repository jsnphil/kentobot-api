import { Logger } from '@aws-lambda-powertools/logger';
import {
  DynamoDBClient,
  QueryCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';

import { unmarshall } from '@aws-sdk/util-dynamodb';
import { BumpType } from '../types/song-request';
import { BumpData } from '@schemas/bump-schema';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-repository' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongBumpRepository {
  async getBumpData(): Promise<BumpData> {
    logger.info('Getting bump data');

    // TODO Change this to a batch get item
    const { Items } = await dynamoDBClient.send(
      new QueryCommand({
        TableName: table,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'bumpData' },
          ':sk': { S: 'bumps' }
        }
      })
    );

    if (!Items || Items.length === 0) {
      return {
        beanBumpsAvailable: 0,
        channelPointBumpsAvailable: 0,
        bumpedUsers: []
      };
    }

    console.log(Items);

    // TODO May need to filter out expired items
    const bumpDataItem = unmarshall(Items[0]);
    const bumpedUserItems = Items.slice(1).map((item) => unmarshall(item));

    return {
      beanBumpsAvailable: bumpDataItem.beanBumpsAvailable,
      channelPointBumpsAvailable: bumpDataItem.channelPointBumpsAvailable,
      bumpedUsers: bumpedUserItems.map((item) => item.bumpedUser)
    };
  }

  async updateRedeemedBeanBumpData(bumpedUser: string, bumpExpiration: number) {
    await dynamoDBClient.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: table,
              Item: {
                pk: { S: 'bumpData' },
                sk: { S: `bumps#user#${bumpedUser}` },
                bumpedUser: { S: bumpedUser },
                bumpExpiration: { N: bumpExpiration.toString() },
                bumpType: { S: BumpType.Bean },
                ttl: { N: bumpExpiration.toString() }
              }
            }
          },
          {
            Update: {
              TableName: table,
              Key: {
                pk: { S: 'bumpData' },
                sk: { S: 'bumps#config' }
              },
              UpdateExpression:
                'SET beanBumpsAvailable = beanBumpsAvailable - :decrement',
              ExpressionAttributeValues: {
                ':decrement': { N: '1' }
              }
            }
          }
        ]
      })
    );
  }

  async updateRedeemedChannelPointsBumpData(
    bumpedUser: string,
    bumpExpiration: number
  ) {
    await dynamoDBClient.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: table,
              Item: {
                pk: { S: 'bumpData' },
                sk: { S: `bumps#user#${bumpedUser}` },
                bumpedUser: { S: bumpedUser },
                bumpExpiration: { N: bumpExpiration.toString() },
                bumpType: { S: BumpType.ChannelPoints },
                ttl: { N: bumpExpiration.toString() }
              }
            }
          },
          {
            Update: {
              TableName: table,
              Key: {
                pk: { S: 'bumpData' },
                sk: { S: 'bumps#config' }
              },
              UpdateExpression:
                'SET channelPointBumpsAvailable = channelPointBumpsAvailable - :decrement',
              ExpressionAttributeValues: {
                ':decrement': { N: '1' }
              }
            }
          }
        ]
      })
    );
  }

  /* istanbul ignore next */
  async resetBumpCounts(count: string) {
    await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: table,
        Key: {
          pk: { S: 'bumpData' },
          sk: { S: 'bumps#config' }
        },
        UpdateExpression:
          'SET channelPointBumpsAvailable = :bumpsAvailable, beanBumpsAvailable = :bumpsAvailable',
        ExpressionAttributeValues: {
          ':bumpsAvailable': { N: count }
        }
      })
    );
  }
}
