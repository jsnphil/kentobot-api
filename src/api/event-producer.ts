import { Logger } from '@aws-lambda-powertools/logger';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const logger = new Logger({ serviceName: 'eventProducerLambda' });

const client = new EventBridgeClient({});

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (event.path === '/song-requests/save') {
    logger.info(`Received save song request`);

    // TODO Make sure the body has a valid song

    console.log(`Event: ${JSON.stringify(event)}`);

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'No song data provided'
        })
      };
    }

    const response = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: event.body,
            DetailType: 'song-played',
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
        message: 'Song request received',
        id: response.Entries![0].EventId
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
