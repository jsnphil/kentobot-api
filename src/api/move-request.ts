import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MoveSongCommandHandler } from '../domains/stream/command-handlers/move-song-command-handler';
import { MoveSongCommand } from '../domains/stream/commands/move-song-command';
import { Logger } from '@aws-lambda-powertools/logger';
import { KentobotErrorCode } from '../types/types';
import { Code } from 'better-status-codes';

const logger = new Logger({ serviceName: 'move-request-lambda' });

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const songId = event.pathParameters?.songId;

  const body = JSON.parse(event.body || '{}');
  const { position } = body;

  if (!songId || !position) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'songId and position are required'
      })
    };
  }

  try {
    const commandHandler = new MoveSongCommandHandler();
    const command = new MoveSongCommand(songId, position);

    await commandHandler.execute(command);

    return {
      statusCode: Code.OK,
      body: JSON.stringify({})
    };
  } catch (error) {
    logger.error(`Error processing request: ${error}`);
    return {
      statusCode: Code.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        error: {
          code: KentobotErrorCode.SystemError,
          message: 'An error occurred while removing the song from the queue'
        }
      })
    };
  }
};
