import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { searchForVideo } from '../../../utils/youtube-client';
import { checkRequestRules } from '../../../utils/song-request-rules';
import { parse, toSeconds } from 'iso8601-duration';
import { SongRepository } from '../../../repositories/song-repository';
import { RequestSongSchema } from '../../../schemas/schema';
import {
  RequestSongBody,
  SongInfo,
  SongRequestResult,
  YouTubeSearchResult
} from '../../../types/song-request';
import { SongQueue } from '../../../song-queue';
import { VideoListItem } from '../../../types/youtube';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const songRepository = new SongRepository();

export interface SongRequestLookup {
  readonly validSongRequest: boolean;
  readonly failedRule?: string;
  readonly songInfo?: SongInfo;
}

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  const songRequest = getSongId(event);
  const songRequestResult = await findRequestedSong(songRequest.youtubeId);

  return createResponse(songRequestResult);
};

export const createResponse = (songRequestResult?: SongRequestResult) => {
  let response: APIGatewayProxyResult;
  if (songRequestResult?.songInfo) {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        title: songRequestResult.songInfo.title,
        youtubeId: songRequestResult.songInfo.youtubeId,
        length: songRequestResult.songInfo.length,
        playCount: songRequestResult.songInfo.playCount
      })
    };
  } else if (songRequestResult?.failedRule) {
    response = {
      statusCode: 400,
      body: JSON.stringify({
        code: 400,
        message: 'Invalid song request for ID',
        error: [songRequestResult.failedRule]
      })
    };
  } else if (songRequestResult?.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 500,
        message: 'Song request lookup failed'
      })
    };
  } else {
    response = {
      statusCode: 404,
      body: JSON.stringify({
        code: 404,
        message: 'No result found',
        error: ['No request found for ID']
      })
    };
  }

  return response;
};

// TODO Move this a utility?

export const getYouTubeVideo = async (
  songId: string
): Promise<YouTubeSearchResult | undefined> => {
  const videos = await searchForVideo(songId);

  logger.debug(`YouTube data: ${JSON.stringify(videos, null, 2)}`);

  if (!videos || videos.length === 0) {
    return undefined;
  } else if (videos.length > 1) {
    return {
      failedRule: 'Too many results'
    } as YouTubeSearchResult;
  }

  const video = videos[0];

  const ruleStatus = await checkRequestRules(video);
  if (ruleStatus.allowedVideo) {
    return {
      video
    };
  } else {
    return {
      failedRule: ruleStatus.failedRule
    };
  }
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
): Promise<SongRequestResult | undefined> => {
  try {
    logger.debug('Checking if song exists in database');
    const songInfo = await songRepository.getSongInfo(songId);

    if (songInfo) {
      logger.info('Song found in database');

      return {
        songInfo
      } as SongRequestResult;
    }

    logger.info(`Getting song request for song ID: ${songId} from YouTube`);
    const youtubeResult = await getYouTubeVideo(songId);

    if (youtubeResult?.video) {
      return {
        songInfo: {
          youtubeId: youtubeResult.video.id,
          title: youtubeResult.video.snippet.title,
          length: toSeconds(parse(youtubeResult.video.contentDetails.duration)),
          playCount: 0
        }
      } as SongRequestResult;
    } else if (youtubeResult?.failedRule) {
      return {
        failedRule: youtubeResult.failedRule
      };
    } else {
      return undefined;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }

    return {
      error: new Error('System failure looking up song')
    };
  }
};
