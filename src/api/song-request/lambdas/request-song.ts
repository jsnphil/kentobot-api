import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { searchForVideo } from '../../../utils/youtube-client';
import { processSongRequestRules } from '../../../utils/song-request-rules';

const logger = new Logger({ serviceName: 'requestSongLambda' });

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Hello World');

  logger.info(`API request: ${JSON.stringify(event, null, 2)}`);

  const songId = event.pathParameters?.songId;
  if (!songId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing song ID'
      })
    };
  }

  console.log(`Getting song request for song ID: ${songId}`);

  const videos = await searchForVideo(songId);

  if (!videos || videos.length === 0) {
    logger.warn(`No results returned`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        code: 404,
        message: 'No results found'
      })
    };
  }

  if (videos.length > 1) {
    logger.warn(
      `Too many results found, Recieved  ${videos.length}, expected 1`
    );

    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 400,
        message: 'Too many results'
      })
    };
  }

  const video = videos[0];

  logger.debug(`YouTube data: ${JSON.stringify(video, null, 2)}`);
  const rulesCheck = await processSongRequestRules(video);

  return {
    statusCode: 200,
    body: JSON.stringify({
      title: video.snippet.title,
      youtubeId: video.id,
      length: video.contentDetails.duration
    })
  };
};
