import { APIGatewayEvent } from 'aws-lambda';
import { SongRequestCommandHandler } from './song-request-command-handler';
import { SaveSongCommand } from '../commands/save-song';
import { SaveSongPlayCommand } from '../commands/save-song-play';

beforeEach(() => {
  jest.resetAllMocks;
  jest.clearAllMocks;
});

describe('song-request-command-handler', () => {
  it('should return a 204 response when the song is saved', async () => {
    const mockRequest = {
      body: JSON.stringify({ videoId: 'XXX' })
    } as APIGatewayEvent;

    const mockSaveSongInfo = jest
      .spyOn(SaveSongCommand.prototype, 'execute')
      .mockImplementation(jest.fn());

    const mockSaveSongPlay = jest
      .spyOn(SaveSongPlayCommand.prototype, 'execute')
      .mockImplementation(jest.fn());

    const songRequestHandler = new SongRequestCommandHandler();
    const response = await songRequestHandler.saveSong(mockRequest);

    expect(response.statusCode).toBe(204);
  });

  it('should return a 202 response when the song info fails to save', async () => {
    const mockRequest = {
      body: JSON.stringify({ videoId: 'XXX' })
    } as APIGatewayEvent;

    const mockSaveSongInfo = jest
      .spyOn(SaveSongCommand.prototype, 'execute')
      .mockRejectedValueOnce(new Error('Failed to save song'));

    const mockSaveSongPlay = jest.spyOn(
      SaveSongPlayCommand.prototype,
      'execute'
    );

    const songRequestHandler = new SongRequestCommandHandler();
    const response = await songRequestHandler.saveSong(mockRequest);

    expect(mockSaveSongPlay).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual(
      JSON.stringify({ status: 'Request saved to be reprocessed' })
    );
  });

  it('should return a 202 response when the song play fails to save', async () => {
    const mockRequest = {
      body: JSON.stringify({ videoId: 'XXX' })
    } as APIGatewayEvent;

    const mockSaveSongInfo = jest
      .spyOn(SaveSongCommand.prototype, 'execute')
      .mockImplementation(jest.fn());

    const mockSaveSongPlay = jest
      .spyOn(SaveSongPlayCommand.prototype, 'execute')
      .mockRejectedValueOnce(new Error('Failed to save song play'));

    const songRequestHandler = new SongRequestCommandHandler();
    const response = await songRequestHandler.saveSong(mockRequest);

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual(
      JSON.stringify({ status: 'Request saved to be reprocessed' })
    );
  });

  it('should return a 400 response when the request body is empty', async () => {
    const mockRequest = {} as APIGatewayEvent;

    const songRequestHandler = new SongRequestCommandHandler();
    const response = await songRequestHandler.saveSong(mockRequest);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        status: 'error',
        message: 'Invalid input',
        errors: ['No song data received']
      })
    );
  });
});
