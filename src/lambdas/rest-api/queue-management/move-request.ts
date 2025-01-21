import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayEvent, APIGatewayProxyEventPathParameters, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';
import { MoveSongSchema } from '../../../schemas/schema';
import { MoveRequestData } from '../../../types/song-request';
import { SongQueue } from '../../../song-queue';
import { WebSocketService } from '../../../services/web-socket-service';

const logger = new Logger({ serviceName: 'requestSongLambda' });
const webSocketService = new WebSocketService();


export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  const songId = getSongId(event.pathParameters?);
  if (!songId) {
    return {
        statusCode: Code.BAD_REQUEST,
        body: JSON.stringify({
            code: Code.BAD_REQUEST,
            message: 'No song Id found'
        })
    }
  }
  
  const moveRequestData: MoveRequestData = MoveSongSchema.parse(event.body);

  const songQueue = await SongQueue.loadQueue();
  songQueue.moveSong(songId, moveRequestData.position);



  await songQueue.save()

  await webSocketService.broadcast(
    JSON.stringify({ songQueue: songQueue.toArray() })
  );

  return {
    statusCode: Code.OK,
    body: JSON.stringify({
      message: `Song moved to position [${moveRequestData.position}]`
    })
  };
};

export const getSongId = (pathParameters: APIGatewayProxyEventPathParameters) => {
    if (!pathParameters) {
        return undefined;
    }

    return pathParameters.songId;
}