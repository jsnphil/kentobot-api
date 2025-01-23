import { Logger } from '@aws-lambda-powertools/logger';
import {
  APIGatewayEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyResult
} from 'aws-lambda';
import { Code } from 'better-status-codes';
import { MoveSongRequestSchema } from '../../../schemas/schema';
import { MoveRequestData, ValidationResult } from '../../../types/song-request';
import { SongQueue } from '../../../song-queue';
import { WebSocketService } from '../../../services/web-socket-service';
import { request } from 'http';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const webSocketService = new WebSocketService();

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

  const moveRequestData = getMoveSongRequestData(event.body);

  if (moveRequestData.success) {
    const position = moveRequestData.data!.position;
    const songQueue = await SongQueue.loadQueue();
    songQueue.moveSong(songId, position);

    await songQueue.save();

    await webSocketService.broadcast(
      JSON.stringify({ songQueue: songQueue.toArray() })
    );

    return {
      statusCode: Code.OK,
      body: JSON.stringify({
        message: `Song moved to position [${position}]`
      })
    };
  } else {
    return {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        code: Code.BAD_REQUEST,
        message: moveRequestData.errors![0].message
      })
    };
  }
};

export const getSongId = (
  pathParameters: APIGatewayProxyEventPathParameters | null
) => {
  if (pathParameters == null || !pathParameters) {
    return undefined;
  } else {
    return pathParameters!.songId;
  }
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
