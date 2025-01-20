import { Logger } from '@aws-lambda-powertools/logger';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from '@aws-sdk/client-apigatewaymanagementapi';
import { WebSocketConnectionsRepository } from '../repositories/websocket-connections-repository';

const logger = new Logger({ serviceName: 'web-socket-service' });

const client = new ApiGatewayManagementApiClient({
  endpoint: `https://${process.env.WEBSOCKET_API_ID}.execute-api.us-east-1.amazonaws.com/${process.env.WEB_SOCKET_STAGE}`
});

const connectionsRepo = new WebSocketConnectionsRepository();

export class WebSocketService {
  async sendToConnection(connectionId: string, message: string) {
    const params = {
      ConnectionId: connectionId,
      Data: message
    };

    try {
      const response = await client.send(new PostToConnectionCommand(params));
      logger.debug(JSON.stringify(response));
      logger.debug(`Sent message to connection: ${connectionId}`);
    } catch (error) {
      // TODO Need to figure out how to handle send failures

      if (error instanceof Error) {
        logger.warn(error.message);
      }
      logger.warn(`Failed to send message to connection: ${connectionId}`);
    }
  }

  async broadcast(message: string) {
    const connections = await connectionsRepo.getAllConnections();

    await Promise.all(
      connections.map(async (connection) => {
        await this.sendToConnection(connection.connectionId, message);
      })
    );
  }
}
