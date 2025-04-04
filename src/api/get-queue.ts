import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayEvent } from 'aws-lambda';
import { GetQueueRequestHandler } from '../domains/stream/request-handlers/get-queue-query-handler';
import { GetQueueRequest } from '../domains/stream/queries/get-queue-request';
import { Code } from 'better-status-codes';

const logger = new Logger({ serviceName: 'get-queue-lambda' });

export const handler = async (event: APIGatewayEvent) => {
  // TODO Later, get date from the parameters

  try {
    const queryHandler = new GetQueueRequestHandler();
    const queue = await queryHandler.execute(new GetQueueRequest('stream'));

    return {
      statusCode: Code.OK,
      body: JSON.stringify(queue)
    };
  } catch (error) {
    // TODO Update these errors
    logger.error(`Error processing request: ${error}`);
    return {
      statusCode: Code.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        error: {
          message: 'An error occurred while getting the queue'
        }
      })
    };
  }
};
