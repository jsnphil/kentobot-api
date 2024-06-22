import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createNewErrorResponse } from '../../../utils/utilities';
import { GetRequestQuery } from '../queries/get-request';

export class SongRequestHandler {
  async requestSong(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    console.log('Requesting song');

    const songId = event.pathParameters?.songId;
    if (!songId) {
      return createNewErrorResponse(400, 'Invalid input', [
        'No song ID provided'
      ]);
    }

    const songRequestQuery = new GetRequestQuery();
    const result = await songRequestQuery.execute(songId);
    if (!result) {
      return createNewErrorResponse(404, 'Song not found', []);
    }

    return {
      body: JSON.stringify(result),
      statusCode: 200
    };
  }
}
