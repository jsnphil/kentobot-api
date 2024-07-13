import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createNewErrorResponse } from '../../../utils/utilities';
import { GetRequestQuery } from '../queries/get-request';
import { SaveSongCommand } from '../commands/save-song';
import { SaveSongPlayCommand } from '../commands/save-song-play';
import { Song, SongPlay } from '../../../types/song-request';

export class SongRequestCommandHandler {
  async saveSong(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { body } = event;

    if (!body) {
      return createNewErrorResponse(400, 'Invalid input', [
        'No song data received'
      ]);
    }

    // TODO Validate input, use zod?

    console.log(`Saving song request ${body}`);
    const song = JSON.parse(body) as Song;

    try {
      const saveSongInfoResult = await saveSongInformation(song);
      if (saveSongInfoResult) {
        await saveSongPlayInformation(song, JSON.parse(body).requester); // TODO Need a type for the API input object);
        return {
          body: JSON.stringify({ status: 'success' }),
          statusCode: 204
        };
      } else {
        return {
          body: JSON.stringify({
            status: 'Request saved to be reprocessed'
          }),
          statusCode: 202
        };
      }
    } catch (err) {
      return {
        body: JSON.stringify({
          status: 'Request saved to be reprocessed'
        }),
        statusCode: 202
      };
    }
  }
}

const saveSongInformation = async (song: Song) => {
  try {
    const saveSongCommand = new SaveSongCommand();
    await saveSongCommand.execute(song);
    return true;
  } catch (err) {
    // TODO Put song on a queue to reprocess
    return false;
  }
};

const saveSongPlayInformation = async (song: Song, requester: string) => {
  const songPlay: SongPlay = {
    date: new Date(),
    requester: requester,
    sotnContender: false,
    sotnWinner: false,
    sotsWinner: false
  };

  const saveSongPlayCommand = new SaveSongPlayCommand();
  await saveSongPlayCommand.execute(song.youtubeId, songPlay);
};
