import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-controls-repo' });

export class StreamControlsRepository {
  async toggleSongRequests() {
    const response = await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: 'songQueueControls',
        Key: {
          pk: { S: 'streamControls' },
          sk: { S: 'songRequestControls' }
        },
        UpdateExpression: 'SET #attr = NOT #attr',
        ExpressionAttributeNames: {
          '#attr': 'songRequestsOpen'
        }
      })
    );
    console.log(JSON.stringify(response, null, 2));
  }
}
