import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import { handler, getBumpSongRequestData } from './bump-request';
import { SongQueue } from '../../../song-queue';
import { WebSocketService } from '../../../services/web-socket-service';
import { Code } from 'better-status-codes';
import { BumpRequestData, BumpType } from '../../../types/song-request';
import { BumpRequest } from '@schemas/bump-schema';

jest.mock('../../../song-queue');
jest.mock('../../../services/web-socket-service');

describe('bump-request', () => {
  describe('getBumpSongRequestData', () => {
    it('should return success with valid data', () => {
      const requestBody = JSON.stringify({
        user: 'adolin',
        type: BumpType.Bean
      } as BumpRequest);
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'adolin', type: BumpType.Bean }
      });
    });

    it('should return success with valid data with a position', () => {
      const requestBody = JSON.stringify({
        user: 'dalinar',
        type: BumpType.Bean,
        position: 1
      } as BumpRequest);
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'dalinar', type: BumpType.Bean, position: 1 }
      });
    });

    it('should return success with valid data with a mod override', () => {
      const requestBody = JSON.stringify({
        user: 'shallan',
        modAllowed: true,
        type: BumpType.Bean
      });
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'shallan', modAllowed: true, type: BumpType.Bean }
      });
    });

    it('should return an error if requestBody is null', () => {
      const result = getBumpSongRequestData(null);

      expect(result).toEqual({
        success: false,
        errors: [
          {
            code: '400',
            message: 'No bump data found'
          }
        ]
      });
    });

    it('should return an error if requestBody is invalid', () => {
      const requestBody = 'invalid data';
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: false,
        errors: [
          {
            code: '400',
            message: 'Invalid data received'
          }
        ]
      });
    });
  });

  describe('handler', () => {
    it('should return a bad request if there is not a song ID', async () => {
      const result = await handler({} as unknown as APIGatewayProxyEvent);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'No song Id found'
        })
      });
    });

    it('should return a bad request if there is not bump data', async () => {
      const result = await handler({
        pathParameters: { songId: 'songId' }
      } as unknown as APIGatewayProxyEvent);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'No bump data found'
        })
      });
    });
  });
});
