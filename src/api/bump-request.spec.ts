import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './bump-request';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { Code } from 'better-status-codes';

jest.mock('@command-handlers/bump-song-command-handler');

describe('bumpSong', () => {
  const mockExecute = jest.fn();

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
