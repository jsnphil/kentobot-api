import { Logger } from '@aws-lambda-powertools/logger';
import {
  APIGatewayEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyResult
} from 'aws-lambda';
import { Code } from 'better-status-codes';
import { MoveSongRequestSchema } from '../../../schemas/schema';
import { MoveRequestData, ValidationResult } from '../../../types/song-request';
import { getSongId } from '../../../utils/utilities';

const logger = new Logger({ serviceName: 'requestSongLambda' });

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  const songId = getSongId(event?.pathParameters);
  if (!songId) {
    return {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        code: Code.BAD_REQUEST,
        message: 'No song Id found'
      })
    };
  }

  return {
    statusCode: Code.NOT_IMPLEMENTED,
    body: JSON.stringify({
      message: 'Endpoint not implemented'
    })
  };
};

export const getMoveSongRequestData = (
  requestBody: string | null
): ValidationResult<MoveRequestData> => {
  if (!requestBody) {
    return {
      success: false,
      errors: [
        {
          code: '400', // TODO Need a better/different error code
          message: 'No move data found'
        }
      ]
    };
  }

  try {
    const moveRequestData: MoveRequestData = MoveSongRequestSchema.parse(
      JSON.parse(requestBody)
    );

    return {
      success: true,
      data: moveRequestData
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error parsing move request data: ${error.message}`);
    }
    return {
      success: false,
      errors: [
        {
          code: '400', // TODO Need a better error code
          message: 'Invalid data received'
        }
      ]
    };
  }
};
