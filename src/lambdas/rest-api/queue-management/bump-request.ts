import { Logger } from '@aws-lambda-powertools/logger';

import { WebSocketService } from '@services/web-socket-service';
import { SongQueue } from '@song-queue';
import { getSongId } from '@utils/utilities';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { BumpRequest, bumpRequestSchema } from '@schemas/bump-schema';
import { ValidationResult } from '../../../types/song-request';

const logger = new Logger({ serviceName: 'bump-request' });
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

  const bumpRequestData = getBumpSongRequestData(event.body);

  // TODO Clean this up, this is too many if statements
  if (bumpRequestData.success) {
    const songQueue = await SongQueue.loadQueue();

    const bumpResult = await songQueue.bumpSong(
      songId,
      bumpRequestData.data!.type,
      bumpRequestData.data!.position,
      bumpRequestData.data!.modAllowed
    );

    if (bumpResult.success) {
      await songQueue.save();

      await webSocketService.broadcast(
        JSON.stringify({ songQueue: songQueue.toArray() })
      );

      return {
        statusCode: Code.OK,
        body: JSON.stringify({
          message: `Song bumped`
        })
      };
    } else {
      return {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: bumpResult.errors![0].message
        })
      };
    }
  } else {
    return {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        code: Code.BAD_REQUEST,
        message: bumpRequestData.errors![0].message
      })
    };
  }
};

export const getBumpSongRequestData = (
  requestBody: string | null
): ValidationResult<BumpRequest> => {
  if (!requestBody) {
    return {
      success: false,
      errors: [
        {
          code: '400', // TODO Need a better/different error code
          message: 'No bump data found'
        }
      ]
    };
  }

  try {
    const bumpRequestData: BumpRequest = bumpRequestSchema.parse(
      JSON.parse(requestBody)
    );

    return {
      success: true,
      data: bumpRequestData
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
