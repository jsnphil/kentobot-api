import { handler } from './move-request';
import { APIGatewayEvent } from 'aws-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveSongCommandHandler } from '@command-handlers/move-song-command-handler';

vi.mock('@command-handlers/move-song-command-handler');

describe('move-request handler', () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockExecute = vi.fn();
    vi.mocked(MoveSongCommandHandler).mockImplementation(function () {
      return {
        execute: mockExecute
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if songId is missing', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {},
      body: JSON.stringify({ position: 1 })
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      'songId and position are required'
    );
  });

  it('should return 400 if position is missing', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: '123' },
      body: JSON.stringify({})
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      'songId and position are required'
    );
  });

  it('should return 200 and an empty body if the move request is successful', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: '123' },
      body: JSON.stringify({ position: 1 })
    } as any;

    mockExecute.mockResolvedValue({});

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({}));
  });
});
