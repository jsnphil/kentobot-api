import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketService } from '@services/web-socket-service';
import { StreamEvent } from '../../../types/event-types';

const webSocketService = new WebSocketService();
const logger = new Logger({ serviceName: 'add-song-to-queue-event-handler' });

export const handler = async (event: any): Promise<void> => {
  logger.debug(`Received event: ${event}`);

  const detailType = event['detail-type'];

  let wssMessage;
  if (detailType === StreamEvent.SONG_ADDED_TO_QUEUE) {
    const { songId, title, requestedBy, status, duration } = event.detail;

    wssMessage = {
      event: StreamEvent.SONG_ADDED_TO_QUEUE,
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

  if (detailType === StreamEvent.SONG_REMOVED_FROM_QUEUE) {
    const { songId } = event.detail;

    wssMessage = {
      event: StreamEvent.SONG_REMOVED_FROM_QUEUE, // TODO Make this an enum
      data: {
        songId
      }
    };
  }

  if (
    detailType === StreamEvent.SONG_MOVED ||
    detailType === StreamEvent.SONG_BUMPED
  ) {
    const { songId, position } = event.detail;
    wssMessage = {
      event: detailType,
      data: {
        songId,
        position
      }
    };
  }

  await webSocketService.broadcast(JSON.stringify(wssMessage));
};
