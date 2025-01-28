import { APIGatewayEvent } from 'aws-lambda';
import { handler, getBumpSongRequestData } from './bump-request';
import { SongQueue } from '../../../song-queue';
import { WebSocketService } from '../../../services/web-socket-service';
import { Code } from 'better-status-codes';

jest.mock('../../../song-queue');
jest.mock('../../../services/web-socket-service');

describe('bump-request', () => {
  describe('getBumpSongRequestData', () => {
    it('should return success with valid data', () => {
      const requestBody = JSON.stringify({ user: 'username' });
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'username' }
      });
    });

    it('should return success with valid data with a position', () => {
      const requestBody = JSON.stringify({ user: 'username', position: 1 });
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'username', position: 1 }
      });
    });

    it('should return success with valid data with a mod override', () => {
      const requestBody = JSON.stringify({
        user: 'username',
        modOverride: true
      });
      const result = getBumpSongRequestData(requestBody);

      expect(result).toEqual({
        success: true,
        data: { user: 'username', modOverride: true }
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
});
// describe('bump-request handler', () => {
//   let mockEvent: APIGatewayEvent;

//   beforeEach(() => {
//     mockEvent = {
//       body: JSON.stringify({ songId: '123' }),
//       pathParameters: { songId: '123' }
//     } as any;
//   });

//   it('should return 400 if no songId is found', async () => {
//     mockEvent.pathParameters = null;

//     const result = await handler(mockEvent);

//     expect(result.statusCode).toBe(Code.BAD_REQUEST);
//     expect(JSON.parse(result.body).message).toBe('No song Id found');
//   });

//   it('should return 400 if request body is invalid', async () => {
//     mockEvent.body = '';

//     const result = await handler(mockEvent);

//     expect(result.statusCode).toBe(Code.BAD_REQUEST);
//     expect(JSON.parse(result.body).message).toBe('No move data found');
//   });

//   it('should bump the song and return 200', async () => {
//     const mockSongQueue = {
//       bumpSong: jest.fn(),
//       save: jest.fn(),
//       toArray: jest.fn().mockReturnValue([])
//     };
//     (SongQueue.loadQueue as jest.Mock).mockResolvedValue(mockSongQueue);
//     const mockWebSocketService = {
//       broadcast: jest.fn()
//     };
//     (WebSocketService as jest.Mock).mockReturnValue(mockWebSocketService);

//     const result = await handler(mockEvent);

//     expect(result.statusCode).toBe(Code.OK);
//     expect(JSON.parse(result.body).message).toBe('Song bumped');
//     expect(mockSongQueue.bumpSong).toHaveBeenCalledWith('123');
//     expect(mockSongQueue.save).toHaveBeenCalled();
//     expect(mockWebSocketService.broadcast).toHaveBeenCalledWith(
//       JSON.stringify({ songQueue: [] })
//     );
//   });
// });
