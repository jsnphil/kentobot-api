import { Logger } from '@aws-lambda-powertools/logger';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SongRequestSchema } from '../schemas/schema';
import { SongRequest } from '../types/song-request';
import { ApiError } from '../errors/api-error';

const logger = new Logger({ serviceName: 'eventProducerLambda' });

const client = new EventBridgeClient({});

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (event.path === '/song-requests/save') {
    // TODO Move this to a SaveSongRequestCommand

    logger.info(`Received save song request`);
    logger.debug(`Event: ${JSON.stringify(event)}`);

    try {
      const songRequest = getSongRequest(event.body);
      const eventId = await sendEvent('song-played', songRequest);

      return {
        statusCode: 202,
        body: JSON.stringify({
          message: 'Song request received',
          id: eventId
        })
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          statusCode: error.statusCode,
          body: JSON.stringify({
            code: error.statusCode,
            message: error.message
          })
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      code: 400,
      message: 'Invalid request'
    })
  };
};

export const getSongRequest = (body: string | null): SongRequest => {
  if (!body) {
    throw new Error('No song data provided');
  }

  try {
    const songRequest: SongRequest = SongRequestSchema.parse(JSON.parse(body));
    return songRequest;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw new ApiError('Invalid song data', 400);
  }
};

export const sendEvent = async (eventType: string, eventDetails: any) => {
  if (!process.env.EVENT_BUS_NAME) {
    throw new ApiError('Event bus name is not defined', 500);
  }

  try {
    const response = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(eventDetails),
            DetailType: eventType,
            Source: 'kentobot-api',
            EventBusName: process.env.EVENT_BUS_NAME
          }
        ]
      })
    );

    if (response.FailedEntryCount) {
      throw new ApiError('Failed to send event', 500);
    }

    logger.info(`EventBridge response: ${JSON.stringify(response)}`);

    return response.Entries![0].EventId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw new ApiError('Failed to send event', 500);
  }
};
