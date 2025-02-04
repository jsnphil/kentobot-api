import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { getSongId } from '@utils/utilities';
import { SongQueue } from '@song-queue';
import { Logger } from '@aws-lambda-powertools/logger';
import { WebSocketService } from '@services/web-socket-service';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const webSocketService = new WebSocketService();

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
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

  const songQueue = await SongQueue.loadQueue();

  songQueue.removeSong(songId);
  await songQueue.save();

  await webSocketService.broadcast(
    JSON.stringify({ songQueue: songQueue.toArray() })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Song removed from queue'
    })
  };
};
