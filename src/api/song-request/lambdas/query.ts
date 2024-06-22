import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SongRequestHandler } from '../handlers/song-request-handler';
import { createNewErrorResponse } from '../../../utils/utilities';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log(`API request: ${JSON.stringify(event, null, 2)}`);

  const { path } = event;

  const songRequestHandler = new SongRequestHandler();

  // Create a default response
  let response = createNewErrorResponse(400, 'Invalid request', [
    'Invalid path'
  ]);

  if (path.startsWith('/song-requests/request')) {
    response = await songRequestHandler.requestSong(event);
  }

  return response;
};
