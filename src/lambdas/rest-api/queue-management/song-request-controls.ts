import { Logger } from '@aws-lambda-powertools/logger';
import { SongRequestService } from '@services/song-request-service';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';

let songRequestService: SongRequestService;

const logger = new Logger({ serviceName: 'song-request-controls' });

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  // TODO Add query string parameters for status: requests

  const path = event.path;

  const queueStatus = path.endsWith('open-requests') ? 'open' : 'closed';

  if (!songRequestService) {
    songRequestService = new SongRequestService();
  }

  try {
    await songRequestService.toggleSongRequests(queueStatus);

    return {
      statusCode: Code.NO_CONTENT,
      body: ''
    };
  } catch (error) {
    // TODO Match this format to the other error responses

    logger.error(JSON.stringify(error, null, 2));
    return {
      statusCode: Code.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        message: 'Failed to toggle song requests'
      })
    };
  }
};
