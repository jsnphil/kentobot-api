// src/functions/twitch/get-app-token-lambda.ts
import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda';

const logger = new Logger({ serviceName: 'get-app-token' });

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  logger.logEventIfEnabled(event);

  try {
    logger.info(`Client ID: ${process.env.TWITCH_CLIENT_ID}`);
    logger.info(`Client Secret: ${process.env.TWITCH_CLIENT_SECRET}`);

    // const token = await twitchAuthService.getValidAppToken();

    // logger.info('Fetched Twitch app token:', token);

    return {
      statusCode: 200,
      body: JSON.stringify({})
    };
  } catch (err) {
    console.error('Failed to fetch Twitch app token', err);
    return {
      statusCode: 500,
      body: 'Internal error'
    };
  }
};
