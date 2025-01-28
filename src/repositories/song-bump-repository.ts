import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { BumpData } from '../types/queue-management';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-repository' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongBumpRepository {
  async getBumpData(): Promise<BumpData> {
    logger.info('Getting bump data');

    const { Items } = await dynamoDBClient.send(
      new QueryCommand({
        TableName: table,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'bumpData' },
          ':sk': { S: 'bumpData' }
        }
      })
    );

    return {
      bumpsAvailable: 3,
      bumpedUsers: ['user1', 'user2', 'user3']
    };
  }
}
