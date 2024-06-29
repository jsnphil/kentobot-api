import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createNewErrorResponse } from '../../../utils/utilities';
import { GetRequestQuery } from '../queries/get-request';
import { SaveSongCommand } from '../commands/save-song';
import { Song } from '../../../types/song-request';

export class SongRequestCommandHandler {
  async saveSong(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    //   async requestSong(
    //     event: APIGatewayProxyEvent
    //   ): Promise<APIGatewayProxyResult> {
    //     console.log('Requesting song');

    //     const songId = event.pathParameters?.songId;
    //     if (!songId) {
    //       return createNewErrorResponse(400, 'Invalid input', [
    //         'No song ID provided'
    //       ]);
    //     }

    //     const songRequestQuery = new GetRequestQuery();
    //     const result = await songRequestQuery.execute(songId);
    //     if (!result) {
    //       return createNewErrorResponse(404, 'Song not found', []);
    //     }

    const { body } = event;

    if (!body) {
      return createNewErrorResponse(400, 'Invalid input', [
        'No song data received'
      ]);
    }

    console.log(`Saving song request ${body}`);

    const saveSongCommand = new SaveSongCommand();

    const song = JSON.parse(body) as Song;
    const result = await saveSongCommand.execute(song);

    return {
      body: JSON.stringify({ result: 'success' }),
      statusCode: 204
    };
  }
}
