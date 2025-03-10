import { APIGatewayProxyEvent } from 'aws-lambda';
import { getMoveSongRequestData, handler } from './move-request';

describe('move-request', () => {
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
  });

  describe('getMoveSongRequestData', () => {
    it('should return success with valid data', () => {
      const requestBody = JSON.stringify({ position: 1 });
      const result = getMoveSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { position: 1 }
      });
    });

    it('should return an error if requestBody is null', () => {
      const result = getMoveSongRequestData(null);

      expect(result).toEqual({
        success: false,
        errors: [
          {
            code: '400',
            message: 'No move data found'
          }
        ]
      });
    });

    it('should return an error if requestBody is invalid', () => {
      const requestBody = 'invalid data';
      const result = getMoveSongRequestData(requestBody);

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
});
