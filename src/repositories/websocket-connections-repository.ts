import { Logger } from '@aws-lambda-powertools/logger';
import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { WebSocketConnection } from '../types/websockets';

const logger = new Logger({ serviceName: 'web-socket-connection-repository' });

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

const table = process.env.STREAM_DATA_TABLE;

export class WebSocketConnectionsRepository {
  async saveConnection(connectionId: string) {
    try {
      logger.info(`Saving connection: ${connectionId}`);

      const putCommand = new PutItemCommand({
        TableName: table,
        Item: {
          pk: { S: 'wsConnection' },
          sk: { S: `connectionId#${connectionId}` },
          connectionId: { S: connectionId },
          connectedAt: { S: new Date().toISOString() },
          ttl: { N: `${Math.floor(Date.now() / 1000) + 21600}` }
        }
      });

      const response = await dynamoClient.send(putCommand);

      logger.debug(`Saved connection: ${JSON.stringify(response)}`);
    } catch (error) {
      logger.error(`Error saving connection: ${error}`);
      throw new Error('Failed to save connection');
    }
  }

  async deleteConnection(connectionId: string) {
    try {
      logger.info(`Deleting connection: ${connectionId}`);

      const deleteCommand = new DeleteItemCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: {
          pk: { S: 'wsConnection' },
          sk: { S: `connectionId#${connectionId}` }
        }
      });

      const response = await dynamoClient.send(deleteCommand);
      logger.debug(`Deleted connection: ${JSON.stringify(response)}`);
    } catch (error) {
      logger.error(`Error deleting connection: ${error}`);
      throw new Error('Failed to delete connection');
    }
  }

  async getAllConnections() {
    logger.debug('Getting connectionIds');

    const queryCommand = new QueryCommand({
      TableName: table,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: 'wsConnection' },
        ':sk': { S: 'connectionId' }
      }
    });

    const { Items } = await dynamoClient.send(queryCommand);

    const connectionIds: WebSocketConnection[] = [];
    if (Items) {
      for (const item of Items) {
        connectionIds.push({
          connectionId: item.connectionId.S!,
          connectedAt: item.connectedAt.S!
        });
      }
    }

    logger.debug(`ConnectionIds: ${connectionIds}`);
    return connectionIds;
  }
}
