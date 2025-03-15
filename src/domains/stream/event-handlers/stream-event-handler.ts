import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketService } from '@services/web-socket-service';

const webSocketService = new WebSocketService();
const logger = new Logger({ serviceName: 'add-song-to-queue-event-handler' });



export const handler = async (event: any): Promise<void> => {
  logger.debug(`Received event: ${event}`);

  const detailType = event['detail-type'];

  let wssMessage;
  if (detailType === 'song-added-to-queue') {
    const { songId, title, requestedBy, status, duration } = event.detail;

    wssMessage = {
      event: 'song-added', // TODO Make this an enum
      data: {
        song: {
          songId,
          title,
          requestedBy,
          duration,
          status
        }
      }
    };
  }

  if (detailType === 'song-removed-from-queue') {
    const { songId } = event.detail;

    wssMessage = {
      event: 'song-removed', // TODO Make this an enum
      data: {
        songId
      }
    };
  }

  await webSocketService.broadcast(JSON.stringify(wssMessage));
};
