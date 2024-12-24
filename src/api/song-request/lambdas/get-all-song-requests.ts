import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SongRepository } from '../../../repositories/song-repository';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'get-all-songs' });

const songRepository = new SongRepository();

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const songs = await songRepository.getAllSongs();
    return {
      statusCode: 200,
      body: JSON.stringify({
        count: songs.length,
        songs: songs
      })
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error getting all songs', { error: error.message });
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error getting all songs',
        errors: []
      })
    };
  }
};
