import { APIGatewayEvent } from 'aws-lambda';
import { handler } from './request-song';
import { searchForVideo } from '../../../utils/youtube-client';
import { processSongRequestRules } from '../../../utils/song-request-rules';
import { VideoListItem } from '../../../types/youtube';

jest.mock('../../../utils/youtube-client');
jest.mock('../../../utils/song-request-rules');

const mockSearchForVideo = searchForVideo as jest.MockedFunction<
  typeof searchForVideo
>;
const mockProcessSongRequestRules =
  processSongRequestRules as jest.MockedFunction<
    typeof processSongRequestRules
  >;

describe('request-song handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 200 with valid song request', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: 'validSongId' }
    } as any;

    const mockVidoes = [
      {
        id: 'validSongId',
        snippet: { title: 'Valid Song' },
        contentDetails: { duration: 'PT3M30S' }
      }
    ] as any as VideoListItem[];

    mockSearchForVideo.mockResolvedValue(mockVidoes);

    mockProcessSongRequestRules.mockResolvedValue({
      status: true,
      failedRules: []
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      title: 'Valid Song',
      youtubeId: 'validSongId',
      length: 210
    });
  });

  it('should return 404 if no results found', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: 'noResultsSongId' }
    } as any;

    mockSearchForVideo.mockResolvedValue([]);

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('No results found');
  });

  it('should return 400 if too many results found', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: 'multipleResultsSongId' }
    } as any;

    const mockVideoList = [
      {
        id: 'song1',
        snippet: { title: 'Song 1' },
        contentDetails: { duration: 'PT3M30S' }
      },
      {
        id: 'song2',
        snippet: { title: 'Song 2' },
        contentDetails: { duration: 'PT4M30S' }
      }
    ] as any as VideoListItem[];

    mockSearchForVideo.mockResolvedValue(mockVideoList);

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Too many results');
  });

  it('should return 400 if song request fails rules check', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: 'invalidSongId' }
    } as any;

    const mockVideoList = [
      {
        id: 'invalidSongId',
        snippet: { title: 'Invalid Song' },
        contentDetails: { duration: 'PT3M30S' }
      }
    ] as any as VideoListItem[];

    mockSearchForVideo.mockResolvedValue(mockVideoList);

    mockProcessSongRequestRules.mockResolvedValue({
      status: false,
      failedRules: ['rule1', 'rule2']
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid song request');
    expect(JSON.parse(result.body).errors).toEqual(['rule1', 'rule2']);
  });

  it('should return 400 if song ID is missing', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {}
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Missing song ID');
  });

  it('should return 500 for unexpected errors', async () => {
    const event: APIGatewayEvent = {
      pathParameters: { songId: 'errorSongId' }
    } as any;

    mockSearchForVideo.mockRejectedValue(new Error('Unexpected error'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Unexpected error');
  });
});
