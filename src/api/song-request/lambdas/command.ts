import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SongRequestCommandHandler } from '../handlers/song-request-command-handler';
import { createNewErrorResponse } from '../../../utils/utilities';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  // Your code logic here
  console.log(`API request: ${JSON.stringify(event, null, 2)}`);
  const { path } = event;

  const songRequestHandler = new SongRequestCommandHandler();

  let response = createNewErrorResponse(400, 'Invalid request', [
    'Invalid path'
  ]);

  if (path.startsWith('/song-requests/save')) {
    response = await songRequestHandler.saveSong(event);
  }

  return response;
};
