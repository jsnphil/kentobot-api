import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import { SongRequestService } from '../../../services/song-request-service';
import { Code } from 'better-status-codes';

let songRequestService: SongRequestService;

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const user = event.queryStringParameters?.user;

  if (!user) {
    return {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        code: 400,
        message: 'User is required'
      })
    };
  }

  if (!songRequestService) {
    songRequestService = new SongRequestService();
  }

  try {
    await songRequestService.enterShuffle(user);
    return {
      statusCode: Code.OK,
      body: JSON.stringify({
        message: 'User entered in shuffle'
      })
    };
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: Code.BAD_REQUEST,
        message: 'User does not have a song in the queue'
      })
    };
  }
};
