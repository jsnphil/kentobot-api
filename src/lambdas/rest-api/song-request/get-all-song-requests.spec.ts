import { APIGatewayEvent, Context } from 'aws-lambda';
import { SongRepository } from '../../../repositories/song-repository';
import { Logger } from '@aws-lambda-powertools/logger';
import { handler } from './get-all-song-requests';

jest.mock('../../../repositories/song-repository');
jest.mock('@aws-lambda-powertools/logger');

const mockSongRepository = SongRepository as jest.MockedClass<
  typeof SongRepository
>;
const mockLogger = Logger as jest.MockedClass<typeof Logger>;

describe('get-all-song-requests handler', () => {
  beforeEach(() => {
    jest.clearAllMocks;
  });

  it('should return 200 with a list of songs', async () => {
    const mockSongs = [
      { title: 'Song 1', youtubeId: 'yt1', length: 300 },
      { title: 'Song 2', youtubeId: 'yt2', length: 200 }
    ];

    jest
      .spyOn(SongRepository.prototype, 'getAllSongs')
      .mockResolvedValue(mockSongs);

    const event: APIGatewayEvent = {} as any;
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      count: mockSongs.length,
      songs: mockSongs
    });
  });

  it('should return 500 if there is an error', async () => {
    jest
      .spyOn(SongRepository.prototype, 'getAllSongs')
      .mockRejectedValue('Something went wrong');

    const event: APIGatewayEvent = {} as any;
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error getting all songs',
      errors: []
    });
  });
});
