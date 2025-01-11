import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput
} from '@aws-sdk/client-apigatewaymanagementapi';
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketMessageSchema } from '../../../schemas/schema';
import { WebSocketConnectionsRepository } from '../../../repositories/websocket-connections-repository';

interface MessageBody {
  readonly action: string;
  readonly message: string;
}

const logger = new Logger({ serviceName: 'message-handler' });

const client = new ApiGatewayManagementApiClient({
  endpoint: `https://${process.env.WEBSOCKET_API_ID}.execute-api.us-east-1.amazonaws.com/${process.env.WEB_SOCKET_STAGE}`
});

const connectionsRepo = new WebSocketConnectionsRepository();

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  logger.debug(`Received event: ${JSON.stringify(event, null, 2)}`);

  const { routeKey, connectionId } = event.requestContext;

  if (routeKey === '$connect') {
    await connectionsRepo.saveConnection(connectionId);
    return {
      statusCode: 200,
      body: 'Welcome to Kentobot'
    };
  }

  if (routeKey === '$disconnect') {
    await connectionsRepo.deleteConnection(connectionId);
    return {
      statusCode: 200,
      body: 'Thanks for visiting Kentobot'
    };
  }

  if (routeKey === 'sendmessage') {
    const body: MessageBody = JSON.parse(event.body!);
    const { message } = WebSocketMessageSchema.parse(body);

    if (message === 'ping') {
      const input = {
        ConnectionId: connectionId,
        Data: new TextEncoder().encode(JSON.stringify({ message: 'pong' }))
      } as PostToConnectionCommandInput;

      const command = new PostToConnectionCommand(input);
      await client.send(command);

      return {
        statusCode: 200
      };
    } else if (message === 'songqueue') {
      // TODO Get song queue
      // These should be moved to a separate function
      // TODO Get all connection IDS
      // TODO Push to all connections
      // const connectionIds = await getConnectionIds();
      // const queue = await getSongQueue();
      // console.log(queue);
      // for (const connectionId of connectionIds) {
      //   console.log(`Sending queue to connectionId: ${connectionId}`);
      //   const input = {
      //     ConnectionId: connectionId,
      //     Data: new TextEncoder().encode(JSON.stringify({ songQueue: queue }))
      //   } as PostToConnectionCommandInput;
      //   const command = new PostToConnectionCommand(input);
      //   const response = await client.send(command);
      //   console.log('Message sent');
      //   console.log(JSON.stringify(command, null, 2));
      // }
    }
  }

  return {
    statusCode: 200,
    body: 'Message sent'
  };
};
