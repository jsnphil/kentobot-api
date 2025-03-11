import { generateStreamDate } from '@utils/utilities';
import { StartStreamCommand } from '../domains/song/commands/start-stream-command';
import { StartStreamCommandHandler } from '../domains/song/handlers/start-stream-command-handler';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const commandHandler = new StartStreamCommandHandler();

  const streamDate = generateStreamDate();
  const command = new StartStreamCommand(streamDate);
  await commandHandler.execute(command);

  return {
    statusCode: Code.Created,
    body: ''
  };
};
