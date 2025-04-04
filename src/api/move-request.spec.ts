import { handler } from './move-request';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { jest } from '@jest/globals';
import { MoveSongCommandHandler } from '../domains/stream/command-handlers/move-song-command-handler';
import { Stream } from '../domains/stream/models/stream';
import { StreamRepository } from '../domains/stream/repositories/stream-repository';

jest.mock('../domains/stream/command-handlers/move-song-command-handler');

describe('move-request handler', () => {
  let mockExecute: jest.Mock;

  beforeEach(() => {
    mockExecute = jest.fn();
    (MoveSongCommandHandler as jest.Mock).mockImplementation(() => {
      return {
        execute: mockExecute
      };
    });
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

    mockExecute.mockResolvedValue({} as never);

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({}));
  });
});
