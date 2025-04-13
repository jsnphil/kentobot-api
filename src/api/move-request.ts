import { APIGatewayEvent } from 'aws-lambda';
import { MoveSongCommandHandler } from '../command-handlers/move-song-command-handler';
import { MoveSongCommand } from '../commands/move-song-command';
import { Code } from 'better-status-codes';
import { apiLambdaWrapper } from '../common/api-lambda-wrapper';

export const handler = apiLambdaWrapper(async (event: APIGatewayEvent) => {
  const songId = event.pathParameters?.songId;

  const body = JSON.parse(event.body || '{}');
  const { position } = body;

  if (!songId || !position) {
    // TODO Throw this instead
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'songId and position are required'
      })
    };
  }

  const commandHandler = new MoveSongCommandHandler();
  const command = new MoveSongCommand(songId, position);

  await commandHandler.execute(command);

  return {
    statusCode: Code.OK,
    body: JSON.stringify({})
  };
});
