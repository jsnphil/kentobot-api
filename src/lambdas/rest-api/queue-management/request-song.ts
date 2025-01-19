import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { parse, toSeconds } from 'iso8601-duration';
import { SongRepository } from '../../../repositories/song-repository';
import { RequestSongSchema } from '../../../schemas/schema';
import {
  RequestSongBody,
  SongInfo,
  SongRequestErrorCode,
  SongRequestResult,
  YouTubeErrorCode
} from '../../../types/song-request';
import { SongQueue } from '../../../song-queue';
import { Code } from 'better-status-codes';
import { ValidationResult } from '../../../types/types';
import { YouTubeClient } from '../../../utils/youtube-client';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const songRepository = new SongRepository();

let youtubeClient: YouTubeClient;

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  // TODO Move most of this out to make it easier to test
  const songRequest = getSongId(event);
  const songRequestResult = await findRequestedSong(songRequest.youtubeId);

  if (songRequestResult.success && songRequestResult.data) {
    const songQueue = await SongQueue.loadQueue();
    const addQueueResult = await songQueue.addSong({
      youtubeId: songRequestResult.data.youtubeId,
      title: songRequestResult.data.title,
      length: songRequestResult.data.length,
      allowOverride: songRequest.modOverride,
      requestedBy: songRequest.requestedBy
    });

    if (addQueueResult.success) {
      await songQueue.save();
      // TODO Push queue to WS clients

      return {
        statusCode: Code.OK,
        body: JSON.stringify({
          code: Code.OK,
          message: 'Song added to queue',
          song: songRequestResult.data
        })
      };
    } else {
      return createErrorResponse(addQueueResult);
    }
  } else {
    return createErrorResponse(songRequestResult);
  }
};

export const createErrorResponse = (result: ValidationResult<any>) => {
  const error = result.errors![0];
  let errorCode: number;

  if (error.code === YouTubeErrorCode.VIDEO_NOT_FOUND) {
    errorCode = Code.NOT_FOUND;
  } else {
    errorCode = Code.BAD_REQUEST;
  }

  return {
    statusCode: errorCode,
    body: JSON.stringify({
      code: errorCode,
      message: error.message
    })
  };
};

export const getSongId = (event: APIGatewayEvent) => {
  if (!event.body) {
    throw new Error('Missing song ID');
  }

  try {
    const songId: RequestSongBody = RequestSongSchema.parse(
      JSON.parse(event.body)
    );

    return songId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error parsing song ID: ${error.message}`);
    }
    throw new Error('Invalid song request');
  }
};

export const findRequestedSong = async (
  songId: string
): Promise<ValidationResult<SongInfo>> => {
  try {
    logger.debug('Checking if song exists in database');
    const songInfo = await songRepository.getSongInfo(songId);

    if (songInfo) {
      logger.info('Song found in database');

      return {
        success: true,
        data: songInfo
      };
    }

    logger.info(`Getting song request for song ID: ${songId} from YouTube`);

    if (!youtubeClient) {
      youtubeClient = await YouTubeClient.initialize();
    }

    const youtubeResult = await youtubeClient.getVideo(songId);

    if (youtubeResult.success && youtubeResult.data) {
      return {
        success: true,
        data: {
          youtubeId: youtubeResult.data.id,
          title: youtubeResult.data.snippet.title,
          length: toSeconds(parse(youtubeResult.data.contentDetails.duration)),
          playCount: 0
        }
      };
    } else {
      return {
        success: false,
        errors: youtubeResult.errors
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }

    throw new Error('System failure looking up song');
  }
};
