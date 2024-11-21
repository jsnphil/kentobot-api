import { Logger } from '@aws-lambda-powertools/logger';
import { SQSEvent } from 'aws-lambda';

const logger = new Logger({ serviceName: 'saveSongDataLambda' });

export const handler = async (event: SQSEvent) => {
  logger.info(`Received event: ${JSON.stringify(event)}`);

  throw new Error('Not implemented');
};
