import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './enter-shuffle';
import { SongQueueRepository } from '../../../repositories/song-queue-repository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { WebSocketService } from '../../../services/web-socket-service';
import { mockSongQueue } from '../../../mocks/mock-song-queue';

const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('enter-shuffle', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('handler', () => {
    it('should return success', async () => {
      jest
        .spyOn(SongQueueRepository.prototype, 'getQueue')
        .mockResolvedValue(mockSongQueue);

      jest
        .spyOn(SongQueueRepository.prototype, 'saveQueue')
        .mockResolvedValue();

      const broadcast = jest
        .spyOn(WebSocketService.prototype, 'broadcast')
        .mockResolvedValue();

      const result = await handler({
        queryStringParameters: {
          user: 'Shallan'
        }
      } as unknown as APIGatewayProxyEvent);

      expect(broadcast).toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          message: 'User entered in shuffle'
        })
      });
    });

    it('should return a bad request error if the user does not have a song in the queue', async () => {
      jest
        .spyOn(SongQueueRepository.prototype, 'getQueue')
        .mockResolvedValue(mockSongQueue);

      jest
        .spyOn(SongQueueRepository.prototype, 'saveQueue')
        .mockResolvedValue();

      const broadcast = jest
        .spyOn(WebSocketService.prototype, 'broadcast')
        .mockResolvedValue();

      const result = await handler({
        queryStringParameters: {
          user: 'Sadeas'
        }
      } as unknown as APIGatewayProxyEvent);

      expect(broadcast).not.toHaveBeenCalled();

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'User does not have a song in the queue'
        })
      });
    });

    it('should return a bad request error if the user is not specified in the query string', async () => {
      const result = await handler({
        queryStringParameters: {}
      } as unknown as APIGatewayProxyEvent);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'User is required'
        })
      });
    });
  });
});
