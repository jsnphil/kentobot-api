import { Logger } from '@aws-lambda-powertools/logger';
import {
  DynamoDBClient,
  QueryCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { BumpData } from '../types/queue-management';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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
        // FilterExpression: '#timeToLive > :now',
        // ExpressionAttributeNames: {
        //   '#timeToLive': 'ttl'
        // },
        ExpressionAttributeValues: {
          ':pk': { S: 'bumpData' },
          ':sk': { S: 'bumps' }
          // ':now': { N: Math.floor(Date.now() / 1000).toString() }
        }
      })
    );

    if (!Items || Items.length === 0) {
      return {
        bumpsAvailable: 0,
        bumpedUsers: []
      };
    }

    // TODO May need to filter out expired items
    const bumpDataItem = unmarshall(Items[0]);
    const bumpedUserItems = Items.slice(1).map((item) => unmarshall(item));

    return {
      bumpsAvailable: bumpDataItem.bumpsAvailable,
      bumpedUsers: bumpedUserItems.map((item) => item.bumpedUser)
    };
  }

  async updateRedeemedBumpData(bumpedUser: string, bumpExpiration: number) {
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
                'SET bumpsAvailable = bumpsAvailable - :decrement',
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
        UpdateExpression: 'SET bumpsAvailable = :bumpsAvailable',
        ExpressionAttributeValues: {
          ':bumpsAvailable': { N: count }
        }
      })
    );
  }
}
