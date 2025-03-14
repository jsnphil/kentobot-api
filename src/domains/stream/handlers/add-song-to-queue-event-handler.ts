import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketService } from '@services/web-socket-service';

const webSocketService = new WebSocketService();
const logger = new Logger({ serviceName: 'add-song-to-queue-event-handler' });

export const handler = async (event: any): Promise<void> => {
  logger.debug(`Received event: ${event}`);

  const { songId, title, requestedBy, status, duration } = event.detail;

  const songAddedWSSMessage = {
    event: 'song_added', // TODO Make this an enum
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

  await webSocketService.broadcast(JSON.stringify(songAddedWSSMessage));
};
