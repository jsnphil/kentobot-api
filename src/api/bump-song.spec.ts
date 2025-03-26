import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from './bump-song';
import { BumpSongCommandHandler } from '../domains/stream/command-handlers/bump-song-command-handler';
import { BumpSongCommand } from '../domains/stream/commands/bump-song-command';
import { Code } from 'better-status-codes';
import { KentobotErrorCode } from '../types/types';

jest.mock('../domains/stream/command-handlers/bump-song-command-handler');

describe('bumpSong', () => {
  const mockExecute = jest.fn();
  const mockLoggerError = jest.fn();

  beforeAll(() => {
    (BumpSongCommandHandler as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createEvent = (body: any): APIGatewayProxyEvent =>
    ({
      body: JSON.stringify(body)
    } as unknown as APIGatewayProxyEvent);

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
    mockExecute.mockResolvedValue({} as never);

    const result = await handler(event);

    expect(result.statusCode).toBe(Code.OK);
    expect(JSON.parse(result.body)).toEqual({});
  });
});
