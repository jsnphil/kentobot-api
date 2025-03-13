import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RequestSongCommandHandler } from '../domains/song/handlers/request-song-command-handler';
import { RequestSongCommand } from '../domains/song/commands/request-song-command';
import { Code } from 'better-status-codes';
import { KentobotErrorCode } from '../types/types';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // TODO Improve this
    const body = JSON.parse(event.body || '{}');
    const { youtubeId, requestedBy } = body;

    if (!youtubeId || !requestedBy) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'youtubeId and requestedBy are required'
        })
      };
    }

    const commandHandler = new RequestSongCommandHandler();
    const command = new RequestSongCommand(requestedBy, youtubeId);

    const song = await commandHandler.execute(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Song requested successfully',
        song: {
          youtubeId: song.id,
          title: song.title,
          requestedBy: song.requestedBy,
          duration: song.duration,
          status: song.status
        }
      })
    };
  } catch (error) {
    if ((error as Error).message === 'Stream not found') {
      return {
        statusCode: Code.FORBIDDEN,
        body: JSON.stringify({
          error: {
            code: KentobotErrorCode.StreamNotFound,
            message: 'Stream not found'
          }
        })
      };
    } else {
      console.error('Error processing request:', error);
      // TODO How to differentiate error codes
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          error: (error as Error).message
        })
      };
    }
  }
};
