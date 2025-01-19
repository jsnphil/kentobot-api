import { Logger } from '@aws-lambda-powertools/logger';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from '@aws-sdk/client-apigatewaymanagementapi';
import { WebSocketConnectionsRepository } from '../repositories/websocket-connections-repository';

const logger = new Logger({ serviceName: 'message-handler' });

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
      await client.send(new PostToConnectionCommand(params));
      logger.debug(`Sent message to connection: ${connectionId}`);
    } catch (error) {
      logger.error(`Failed to send message to connection: ${connectionId}`);
      throw new Error('Failed to send message');
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
