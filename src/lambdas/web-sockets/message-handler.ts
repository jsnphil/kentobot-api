import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketMessageSchema } from '../../schemas/schema';
import { WebSocketService } from '../../services/web-socket-service';
import { SongQueue } from '../../song-queue';
import { SongRequestService } from '../../services/song-request-service';
import { BumpService } from '@services/bump-service';

interface MessageBody {
  readonly action: string;
  readonly message: string;
}

const logger = new Logger({ serviceName: 'message-handler' });
const songQueueService = new SongRequestService();
const bumpService = new BumpService();

// const client = new ApiGatewayManagementApiClient({
//   endpoint: `https://${process.env.WEBSOCKET_API_ID}.execute-api.us-east-1.amazonaws.com/${process.env.WEB_SOCKET_STAGE}`
// });

const webSocketService = new WebSocketService();

/* istanbul ignore next */
export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  logger.debug(`Received event: ${JSON.stringify(event, null, 2)}`);

  const { routeKey, connectionId } = event.requestContext;
  const { body } = event;

  await handleRoute(routeKey, connectionId, body);

  return {
    statusCode: 200,
    body: 'Message sent'
  };
};

export const handleRoute = async (
  routeKey: string,
  connectionId: string,
  body?: string
) => {
  if (routeKey === '$connect') {
    await webSocketService.saveConnection(connectionId);
  }

  if (routeKey === '$disconnect') {
    await webSocketService.deleteConnection(connectionId);
  }

  if (routeKey === 'sendmessage') {
    const messageBody: MessageBody = JSON.parse(body!);
    const { message } = WebSocketMessageSchema.parse(messageBody);

    await sendMessage(connectionId, message);
  } else {
    // Default route
  }
};

// TODO These need to respond only to the connection that sent the message, broadcasts will be done by the systems
export const sendMessage = async (connectionId: string, message: string) => {
  if (message === 'ping') {
    await webSocketService.sendToConnection(
      connectionId,
      JSON.stringify({ message: 'pong' })
    );
  } else if (message === 'songqueue') {
    const songQueue = await SongQueue.loadQueue();
    await webSocketService.broadcast(
      JSON.stringify({ songQueue: songQueue.toArray() })
    );
  } else if (message === 'songqueue:next') {
    // TODO Will need something here to make sure only the songplayer can call this
    await songQueueService.sendNextSong(connectionId);
  } else if (message === 'songqueue:open') {
    await songQueueService.toggleSongRequests('open');
  } else if (message === 'songqueue:close') {
    await songQueueService.toggleSongRequests('closed');
  } else if (message === 'songqueue:info') {
    // TODO Probably need to wrap this into a "song info service"?
    await bumpService.broadcastBumpData();
  }
};
