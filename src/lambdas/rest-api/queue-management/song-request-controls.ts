import { SongRequestService } from '@services/song-request-service';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';

let songRequestService: SongRequestService;
export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (!songRequestService) {
    songRequestService = new SongRequestService();
  }

  try {
    await songRequestService.toggleSongRequests();

    return {
      statusCode: Code.NO_CONTENT,
      body: ''
    };
  } catch (error) {
    // TODO Match this format to the other error responses

    console.log(JSON.stringify(error, null, 2));
    return {
      statusCode: Code.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        message: 'Failed to toggle song requests'
      })
    };
  }
};
