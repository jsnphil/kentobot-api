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

  if (!youtubeClient) {
    youtubeClient = await YouTubeClient.initialize();
  }

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
        statusCode: Code.NO_CONTENT,
        body: ''
      };
    } else {
      return createNewErrorResponse(addQueueResult);
    }
  } else {
    return createNewErrorResponse(songRequestResult);
  }
};

export const createNewErrorResponse = (result: ValidationResult<any>) => {
  let response: APIGatewayProxyResult = {
    statusCode: Code.INTERNAL_SERVER_ERROR,
    body: JSON.stringify({
      code: Code.INTERNAL_SERVER_ERROR,
      message: 'Song request failed'
    })
  };

  if (result.errors) {
    const error = result.errors[0];

    if (error.code === YouTubeErrorCode.VIDEO_NOT_FOUND) {
      response = {
        statusCode: Code.NOT_FOUND,
        body: JSON.stringify({
          code: Code.NOT_FOUND,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.MULTIPLE_RESULTS) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.VIDEO_NOT_EMBEDDABLE) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.VIDEO_NOT_PUBLIC) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.LIVE_STREAM_VIDEO) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.VIDEO_UNAVAILABLE) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === YouTubeErrorCode.VIDEO_UNLICENSED) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === SongRequestErrorCode.SONG_ALREADY_REQUESTED) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (error.code === SongRequestErrorCode.USER_MAX_REQUESTS) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    } else if (
      error.code === SongRequestErrorCode.SONG_EXCEEDEDS_MAX_DURATION
    ) {
      response = {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
          code: Code.BAD_REQUEST,
          message: error.message
        })
      };
    }
  }

  return response;
};

export const createResponse = (songRequestResult?: SongRequestResult) => {
  let response: APIGatewayProxyResult = {
    statusCode: Code.INTERNAL_SERVER_ERROR,
    body: JSON.stringify({
      code: Code.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error'
    })
  };
  if (songRequestResult?.failedRule) {
    response = {
      statusCode: Code.BAD_REQUEST,
      body: JSON.stringify({
        code: Code.BAD_REQUEST,
        message: 'Invalid song request for ID',
        error: [songRequestResult.failedRule]
      })
    };
  } else if (songRequestResult?.error) {
    return {
      statusCode: Code.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        code: Code.INTERNAL_SERVER_ERROR,
        message: 'Song request lookup failed'
      })
    };
  } else {
    response = {
      statusCode: Code.NOT_FOUND,
      body: JSON.stringify({
        code: Code.NOT_FOUND,
        message: 'No result found',
        error: ['No request found for ID']
      })
    };
  }

  return response;
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
