import { APIGatewayEvent } from 'aws-lambda';
import { handler } from './remove-song';
import { RemoveSongCommandHandler } from '@command-handlers/remove-song-command-handler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@command-handlers/remove-song-command-handler');

describe('remove-song handler', () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockExecute = vi.fn();
    vi.mocked(RemoveSongCommandHandler).mockImplementation(function () {
      return {
        execute: mockExecute
      } as any;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
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

    mockExecute.mockImplementation(() => {
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
