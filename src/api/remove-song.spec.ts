import { APIGatewayEvent } from 'aws-lambda';
import { handler } from './remove-song';
import { RemoveSongCommandHandler } from '@command-handlers/remove-song-command-handler';

jest.mock('@command-handlers/remove-song-command-handler');

describe('remove-song handler', () => {
  let mockRemoveSongCommandHandler: jest.Mocked<RemoveSongCommandHandler>;

  beforeEach(() => {
    mockRemoveSongCommandHandler =
      new RemoveSongCommandHandler() as jest.Mocked<RemoveSongCommandHandler>;
    (RemoveSongCommandHandler as jest.Mock).mockImplementation(
      () => mockRemoveSongCommandHandler
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 if songId is not provided', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({}),
      pathParameters: {}
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: 'songId is required' });
  });

  it('should return 200 if song is removed successfully', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({}),
      pathParameters: { songId: '123' }
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Song removed from queue successfully',
      songId: '123'
    });
  });

  it('should return 500 if an error occurs', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({}),
      pathParameters: { songId: '123' }
    } as any;

    mockRemoveSongCommandHandler.execute.mockImplementation(() => {
      throw new Error('Test error');
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: {
        code: 'SYSTEM_ERROR',
        message: 'An error occurred while removing the song from the queue'
      }
    });
  });
});
