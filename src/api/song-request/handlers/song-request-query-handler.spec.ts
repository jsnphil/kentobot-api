import { APIGatewayEvent } from 'aws-lambda';
import { GetRequestQuery } from '../queries/get-request';
import { SongRequestQueryHandler } from './song-request-query-handler';

describe('song-request-query-handler', () => {
  it('should return a 200 response when the song is found', async () => {
    const mockRequest = {
      pathParameters: {
        songId: 'XXX'
      }
    } as unknown as APIGatewayEvent;

    const mockGetRequestQuery = jest
      .spyOn(GetRequestQuery.prototype, 'execute')
      .mockResolvedValueOnce({
        youtubeId: 'XXX',
        title: 'Test Song',
        length: 61
      });

    const songRequestHandler = new SongRequestQueryHandler();
    const response = await songRequestHandler.requestSong(mockRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        youtubeId: 'XXX',
        title: 'Test Song',
        length: 61
      })
    );
  });

  it('should return a 404 response when the song is not found', async () => {
    const mockRequest = {
      pathParameters: {
        songId: 'XXX'
      }
    } as unknown as APIGatewayEvent;

    const mockGetRequestQuery = jest
      .spyOn(GetRequestQuery.prototype, 'execute')
      .mockResolvedValueOnce(undefined);

    const songRequestHandler = new SongRequestQueryHandler();
    const response = await songRequestHandler.requestSong(mockRequest);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(
      JSON.stringify({ code: 404, message: 'Song not found', errors: [] })
    );
  });

  it('should return a 400 response when the song ID is not provided', async () => {
    const mockRequest = {
      pathParameters: {}
    } as unknown as APIGatewayEvent;

    const songRequestHandler = new SongRequestQueryHandler();
    const response = await songRequestHandler.requestSong(mockRequest);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        code: 400,
        message: 'Invalid input',
        errors: ['No song ID provided']
      })
    );
  });

  it('should return a 400 response when there are no path parameters', async () => {
    const mockRequest = {
      pathParameters: undefined
    } as unknown as APIGatewayEvent;

    const songRequestHandler = new SongRequestQueryHandler();
    const response = await songRequestHandler.requestSong(mockRequest);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        code: 400,
        message: 'Invalid input',
        errors: ['No song ID provided']
      })
    );
  });
});
