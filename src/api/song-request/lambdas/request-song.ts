import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { searchForVideo } from '../../../utils/youtube-client';
import { processSongRequestRules } from '../../../utils/song-request-rules';
import { parse, toSeconds } from 'iso8601-duration';
import { SongRepository } from '../../../repositories/song-repository';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const songRepository = new SongRepository();

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const songId = getSongId(event);

    const songInfo = await songRepository.getSongInfo(songId);
    if (songInfo) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: songInfo.title,
          youtubeId: songInfo.youtubeId,
          length: songInfo.length,
          playCount: songInfo.playCount
        })
      };
    }

    logger.info(`Getting song request for song ID: ${songId}`);

    const video = await getYouTubeVideo(songId);

    const rulesCheck = await processSongRequestRules(video);

    if (!rulesCheck.status) {
      logger.warn(`Song request failed rules check`);

      return createNewErrorResponse(
        new Error('Invalid song request'),
        rulesCheck.failedRules
      );
    } else {
      const length = toSeconds(parse(video.contentDetails.duration));

      return {
        statusCode: 200,
        body: JSON.stringify({
          title: video.snippet.title,
          youtubeId: video.id,
          length: length
        })
      };
    }
  } catch (error) {
    return createNewErrorResponse(error as Error);
  }
};

const createNewErrorResponse = (
  error: Error,
  failedRules?: string[]
): APIGatewayProxyResult => {
  logger.error(`Error processing song request: ${error.message}`);

  let statusCode = 500;

  if (error.message === 'No results found') {
    statusCode = 404;
  } else if (
    error.message === 'Missing song ID' ||
    error.message === 'Too many results' ||
    error.message === 'Invalid song request'
  ) {
    statusCode = 400;
  }

  return {
    statusCode: statusCode,
    body: JSON.stringify({
      code: statusCode,
      message: error.message,
      errors: failedRules || []
    })
  };
};

// TODO Move this a utility?
const getYouTubeVideo = async (songId: string) => {
  const videos = await searchForVideo(songId);

  logger.debug(`YouTube data: ${JSON.stringify(videos, null, 2)}`);

  if (!videos || videos.length === 0) {
    throw new Error('No results found');
  } else if (videos.length > 1) {
    throw new Error('Too many results');
  }

  return videos[0];
};

const getSongId = (event: APIGatewayEvent) => {
  const songId = event.pathParameters?.songId;

  if (!songId) {
    throw new Error('Missing song ID');
  }

  return songId;
};
