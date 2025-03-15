import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RemoveSongCommand } from '../domains/song/commands/remove-song-command';
import { RemoveSongCommandHandler } from '../domains/song/handlers/remove-song-command-handler';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // TODO Improve this
    const body = JSON.parse(event.body || '{}');

    const songId = event.pathParameters?.songId;

    if (!songId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'songId is required'
        })
      };
    }

    const commandHandler = new RemoveSongCommandHandler();
    const command = new RemoveSongCommand(songId);

    await commandHandler.execute(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Song removed from queue successfully',
        songId
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          code: 'SystemError',
          message: 'An error occurred while removing the song from the queue'
        }
      })
    };
  }
};
