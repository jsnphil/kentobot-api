import { handler } from './save-played-request';
import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import { SavePlayedSongCommandHandler } from '../domains/stream/command-handlers/save-played-song-command-handler';
import { SavePlayedSongCommand } from '../domains/stream/commands/save-played-song-command';

jest.mock(
  '../domains/stream/command-handlers/save-played-song-command-handler'
);

const createEvent = (body: any): APIGatewayProxyEvent =>
  ({
    body: JSON.stringify(body)
  } as unknown as APIGatewayProxyEvent);

describe('save-played-request handler', () => {
  const mockExecute = jest.fn();
  beforeAll(() => {
    (SavePlayedSongCommandHandler as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 201 when the song is saved successfully', async () => {
    const event = createEvent({
      songId: '123',
      title: 'Test Song',
      requestedBy: 'Dalinar',
      duration: 300
    });

    const mockCommandHander = jest
      .spyOn(SavePlayedSongCommandHandler.prototype, 'execute')
      .mockResolvedValue({} as never);

    const response = await handler(event);

    expect(mockCommandHander).toHaveBeenCalledWith(
      new SavePlayedSongCommand('123', 'Test Song', 'Dalinar', 300)
    );

    expect(response.statusCode).toBe(201);
    expect(response.body).toBe('');
  });

  it('should return 400 when required fields are missing', async () => {
    const event: APIGatewayEvent = {
      detail: {
        title: 'Test Song',
        requestedBy: 'Jasnah'
      }
    } as any;

    const mockCommandHander = jest.spyOn(
      SavePlayedSongCommandHandler.prototype,
      'execute'
    );

    const response = await handler(event);

    expect(mockCommandHander).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('should return 500 when an error occurs during execution', async () => {
    const event = createEvent({
      songId: '123',
      title: 'Test Song',
      requestedBy: 'Lift',
      duration: 300
    });

    const mockCommandHander = jest
      .spyOn(SavePlayedSongCommandHandler.prototype, 'execute')
      .mockRejectedValue(new Error('Internal Server Error'));

    const response = await handler(event);

    expect(mockCommandHander).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(
      JSON.stringify({
        error: {
          code: 'SystemError',
          message: 'An error occurred while processing the request'
        }
      })
    );
  });
});
