import { APIGatewayEvent } from 'aws-lambda';
import { apiLambdaWrapper } from '../common/api-lambda-wrapper';
import { Code } from 'better-status-codes';

import { ToggleShuffleCommand } from '../commands/toggle-shuffle-command';
import { ShuffleCommandHandler } from '../command-handlers/shuffle-command-handler';
import { Command } from '../commands/command';

export const handler = async (event: APIGatewayEvent) => {
  console.log('Event: ', JSON.stringify(event, null, 2));

  const commandHandler = new ShuffleCommandHandler();
  let command: Command;

  console.log('Event path: ', event.path);
  if (event.path.endsWith('/queue/shuffle/toggle')) {
    console.log('Toggle shuffle command received');
    const body = JSON.parse(event.body || '{}');
    const { status } = body;

    console.log('Status: ', status);

    if (status !== 'open' && status !== 'close') {
      return {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({ message: 'Invalid status' })
      };
    }

    command = new ToggleShuffleCommand(status);
  }

  // TODO Ensure this is defined when the others commands are implemented
  await commandHandler.execute(command!);

  return {
    statusCode: Code.OK,
    body: JSON.stringify({})
  };
};
