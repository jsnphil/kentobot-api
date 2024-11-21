import { Logger } from '@aws-lambda-powertools/logger';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const logger = new Logger({ serviceName: 'requestSongLambda' });

const client = new EventBridgeClient({});

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Received API event: ${JSON.stringify(event)}`);

  logger.info(`Path: ${event.path}`);
  logger.info(`Method: ${event.httpMethod}`);
  logger.info(`Body: ${event.body}`);

  if (event.path === '/song-requests/save') {
    logger.info(`Received save song request`);

    // TODO Make sure the body has a valid song

    const response = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(event.body),
            DetailType: 'save-song-data',
            Source: 'kentobot-api',
            EventBusName: process.env.EVENT_BUS_NAME
          }
        ]
      })
    );

    logger.info(`EventBridge response: ${JSON.stringify(response)}`);

    return {
      statusCode: 202,
      body: JSON.stringify({
        message: 'Song request received'
      })
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      code: 400,
      message: 'Invalid request'
    })
  };
};
