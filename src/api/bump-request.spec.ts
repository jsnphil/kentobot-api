import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './bump-request';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpSongCommand } from '@commands/bump-song-command';
import { Code } from 'better-status-codes';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { vi, Mock } from 'vitest';

vi.mock('@command-handlers/bump-song-command-handler');
vi.mock('@commands/bump-song-command');
vi.mock('@aws-lambda-powertools/logger');

describe('bumpSong', () => {
  let mockExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockExecute = vi.fn();
    vi.mocked(BumpSongCommandHandler).mockImplementation(function () {
      return {
        execute: mockExecute
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (body: any): APIGatewayProxyEvent =>
    ({
      body: JSON.stringify(body)
    }) as unknown as APIGatewayProxyEvent;

  it('should return 400 if user is not provided', async () => {
    const event = createEvent({
      position: 1,
      bumpType: 'up',
      modOverride: false
    });

    const result = await handler(event);

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('User is required');
  });

  it('should return 200 and bump the song successfully', async () => {
    const event = createEvent({
      user: 'Kaladin',
      position: 1,
      bumpType: 'bean',
      modOverride: false
    });

    mockExecute.mockResolvedValue({});

    const result = await handler(event);

    expect(result.statusCode).toBe(Code.OK);
    expect(JSON.parse(result.body)).toEqual({});
    expect(BumpSongCommand).toHaveBeenCalledWith('bean', 'Kaladin', 1, false);
    expect(mockExecute).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should return 500 when command handler throws an error', async () => {
    const event = createEvent({
      user: 'Kaladin',
      position: 1,
      bumpType: 'bean',
      modOverride: false
    });

    const error = new Error('Database connection failed');
    mockExecute.mockRejectedValue(error);

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toEqual({
      code: 'SYSTEM_ERROR',
      message: 'An error occurred while removing the song from the queue'
    });
  });

  it('should handle empty event body gracefully', async () => {
    const event = {
      body: null
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('User is required');
  });
});
