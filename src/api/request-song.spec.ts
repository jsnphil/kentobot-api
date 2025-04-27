import { APIGatewayEvent } from 'aws-lambda';
import { handler } from './request-song';
import { RequestSongCommandHandler } from '@command-handlers/request-song-command-handler';

jest.mock('@command-handlers/request-song-command-handler');

describe('request-song handler', () => {
  let mockExecute: jest.Mock;

  beforeEach(() => {
    mockExecute = jest.fn();
    (RequestSongCommandHandler as jest.Mock).mockImplementation(() => {
      return {
        execute: mockExecute
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and song details when request is successful', async () => {
    const mockSong = {
      id: '123',
      title: 'Test Song',
      requestedBy: 'User1',
      duration: 300,
      status: 'requested'
    };
    mockExecute.mockResolvedValue(mockSong);

    const event = {
      body: JSON.stringify({ youtubeId: '123', requestedBy: 'User1' })
    } as unknown as APIGatewayEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Song requested successfully',
      song: {
        youtubeId: '123',
        title: 'Test Song',
        requestedBy: 'User1',
        duration: 300,
        status: 'requested'
      }
    });
  });

  it('should return 400 when youtubeId or requestedBy is missing', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({ youtubeId: '123' })
    } as unknown as APIGatewayEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: 'youtubeId and requestedBy are required'
    });
  });

  it('should return 500 when an error occurs', async () => {
    mockExecute.mockRejectedValue(new Error('Test error'));

    const event: APIGatewayEvent = {
      body: JSON.stringify({ youtubeId: '123', requestedBy: 'User1' })
    } as unknown as APIGatewayEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal server error',
      error: 'Test error'
    });
  });
});
