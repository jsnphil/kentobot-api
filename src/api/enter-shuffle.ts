import { APIGatewayEvent } from 'aws-lambda';
import { apiLambdaWrapper } from '../common/api-lambda-wrapper';
import { Code } from 'better-status-codes';
import { EnterShuffleCommandHandler } from '../domains/stream/command-handlers/enter-shuffle-command-handler';
import { EnterShuffleCommand } from '../domains/stream/commands/enter-shuffle-command';

export const handler = apiLambdaWrapper(async (event: APIGatewayEvent) => {
  const body = JSON.parse(event.body || '{}');
  const { user } = body;

  if (!user) {
    // TODO Throw this instead
    return {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        message: 'user is required'
      })
    };
  }

  const commandHandler = new EnterShuffleCommandHandler();
  const command = new EnterShuffleCommand(user);

  await commandHandler.execute(command);

  return {
    statusCode: Code.OK,
    body: JSON.stringify({})
  };
});
