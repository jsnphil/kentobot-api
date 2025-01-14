import { APIGatewayEvent } from 'aws-lambda';
import {
  createResponse,
  findRequestedSong,
  getSongId,
  getYouTubeVideo,
  handler
} from './request-song';
import { searchForVideo } from '../../../utils/youtube-client';
import { checkRequestRules } from '../../../utils/song-request-rules';
import { VideoListItem } from '../../../types/youtube';
import { SongRepository } from '../../../repositories/song-repository';

jest.mock('../../../utils/youtube-client');
jest.mock('../../../utils/song-request-rules');
jest.mock('../../../repositories/song-repository');

const mockSearchForVideo = searchForVideo as jest.MockedFunction<
  typeof searchForVideo
>;

const mockRequestRules = checkRequestRules as jest.MockedFunction<
  typeof checkRequestRules
>;

describe('Request Song', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // describe('handler', () => {
  //   it('should return 200 with valid song request', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'validSongId' })
  //     } as any;

  //     const mockVidoes = [
  //       {
  //         id: 'validSongId',
  //         snippet: { title: 'Valid Song' },
  //         contentDetails: { duration: 'PT3M30S' }
  //       }
  //     ] as any as VideoListItem[];

  //     mockSearchForVideo.mockResolvedValue(mockVidoes);

  //     mockProcessSongRequestRules.mockResolvedValue({
  //       status: true,
  //       failedRules: []
  //     });

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(200);
  //     expect(JSON.parse(result.body)).toEqual({
  //       title: 'Valid Song',
  //       youtubeId: 'validSongId',
  //       length: 210
  //     });
  //   });

  //   it('should return 404 if no results found', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'noResultsSongId' })
  //     } as any;

  //     mockSearchForVideo.mockResolvedValue([]);

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(404);
  //     expect(JSON.parse(result.body).message).toBe('No results found');
  //   });

  //   it('should return 400 if too many results found', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'multipleResultsSongId' })
  //     } as any;

  //     const mockVideoList = [
  //       {
  //         id: 'song1',
  //         snippet: { title: 'Song 1' },
  //         contentDetails: { duration: 'PT3M30S' }
  //       },
  //       {
  //         id: 'song2',
  //         snippet: { title: 'Song 2' },
  //         contentDetails: { duration: 'PT4M30S' }
  //       }
  //     ] as any as VideoListItem[];

  //     mockSearchForVideo.mockResolvedValue(mockVideoList);

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(400);
  //     expect(JSON.parse(result.body).message).toBe('Too many results');
  //   });

  //   it('should return 400 if song request fails rules check', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'invalidSongId' })
  //     } as any;

  //     const mockVideoList = [
  //       {
  //         id: 'invalidSongId',
  //         snippet: { title: 'Invalid Song' },
  //         contentDetails: { duration: 'PT3M30S' }
  //       }
  //     ] as any as VideoListItem[];

  //     mockSearchForVideo.mockResolvedValue(mockVideoList);

  //     mockProcessSongRequestRules.mockResolvedValue({
  //       status: false,
  //       failedRules: ['rule1', 'rule2']
  //     });

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(400);
  //     expect(JSON.parse(result.body).message).toBe('Invalid song request');
  //     expect(JSON.parse(result.body).errors).toEqual(['rule1', 'rule2']);
  //   });

  //   it('should return 400 if song ID is missing', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {} as any;

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(400);
  //     expect(JSON.parse(result.body).message).toBe('Missing song ID');
  //   });

  //   it('should return 500 for unexpected errors', async () => {
  //     jest
  //       .spyOn(SongRepository.prototype, 'getSongInfo')
  //       .mockResolvedValue(undefined);

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'errorSongId' })
  //     } as any;

  //     mockSearchForVideo.mockRejectedValue(new Error('Unexpected error'));

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(500);
  //     expect(JSON.parse(result.body).message).toBe('Unexpected error');
  //   });

  //   it('should return 200 with existing song info', async () => {
  //     jest.spyOn(SongRepository.prototype, 'getSongInfo').mockResolvedValue({
  //       title: 'Existing Song',
  //       youtubeId: 'validSongId',
  //       length: 210,
  //       playCount: 10
  //     });

  //     const event: APIGatewayEvent = {
  //       body: JSON.stringify({ youtubeId: 'validSongId' })
  //     } as any;

  //     const mockVidoes = [
  //       {
  //         id: 'validSongId',
  //         snippet: { title: 'Valid Song' },
  //         contentDetails: { duration: 'PT3M30S' }
  //       }
  //     ] as any as VideoListItem[];

  //     const result = await handler(event);

  //     expect(result.statusCode).toBe(200);
  //     expect(JSON.parse(result.body)).toEqual({
  //       title: 'Existing Song',
  //       youtubeId: 'validSongId',
  //       length: 210,
  //       playCount: 10
  //     });

  //     expect(mockSearchForVideo).not.toHaveBeenCalled();
  //   });
  // });

  describe('findRequestedSong', () => {
    it('should return a valid song when found in the database', async () => {
      jest.spyOn(SongRepository.prototype, 'getSongInfo').mockResolvedValue({
        title: 'Existing Song',
        youtubeId: 'validSongId',
        length: 210,
        playCount: 10
      });

      expect(await findRequestedSong('validSongId')).toEqual({
        songInfo: {
          title: 'Existing Song',
          youtubeId: 'validSongId',
          length: 210,
          playCount: 10
        }
      });
    });

    it('should return a valid song when not found in the database', async () => {
      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockResolvedValue(undefined);

      const mockVideo = {
        id: 'validSongId',
        snippet: { title: 'Valid Song' },
        contentDetails: { duration: 'PT3M30S' }
      } as any as VideoListItem;

      mockSearchForVideo.mockResolvedValue([mockVideo]);
      mockRequestRules.mockResolvedValue({ allowedVideo: true });

      expect(await findRequestedSong('validSongId')).toEqual({
        songInfo: {
          youtubeId: 'validSongId',
          title: 'Valid Song',
          length: 210,
          playCount: 0
        }
      });
    });

    it('should not return a song if not found in the database or YouTube', async () => {
      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockResolvedValue(undefined);

      mockSearchForVideo.mockResolvedValue([]);

      expect(await findRequestedSong('invalidSongId')).toBeUndefined();
    });
  });

  describe('getSongId', () => {
    it('should return a song ID for a valid POST body without an override flag', () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({ youtubeId: 'validSongId', requestedBy: 'user' })
      } as any;

      expect(getSongId(event)).toEqual({
        youtubeId: 'validSongId',
        requestedBy: 'user'
      });
    });

    it('should return a song ID for a valid POST body with an override flag', () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({
          youtubeId: 'validSongId',
          requestedBy: 'user',
          modOverride: true
        })
      } as any;

      expect(getSongId(event)).toEqual({
        youtubeId: 'validSongId',
        requestedBy: 'user',
        modOverride: true
      });
    });

    it('should throw an error if the body is not present', () => {
      const event: APIGatewayEvent = {} as any;

      expect(() => getSongId(event)).toThrow('Missing song ID');
    });

    it('should throw an error if the body is not valid JSON', () => {
      const event: APIGatewayEvent = {
        body: 'not a JSON string'
      } as any;

      expect(() => getSongId(event)).toThrow('Invalid song request');
    });

    it('should throw an error if the body is not a valid song request', () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({ invalidKey: 'invalidValue' })
      } as any;

      expect(() => getSongId(event)).toThrow('Invalid song request');
    });
  });

  describe('getYouTubeVideo', () => {
    it('should return a video for a valid ID', async () => {
      const mockVideo = {
        id: 'validSongId',
        snippet: { title: 'Valid Song' },
        contentDetails: { duration: 'PT3M30S' }
      } as any as VideoListItem;

      mockSearchForVideo.mockResolvedValue([mockVideo]);
      mockRequestRules.mockResolvedValue({ allowedVideo: true });

      expect(await getYouTubeVideo('validSongId')).toEqual({
        video: mockVideo
      });
    });

    it('should not return a video for an invalid ID', async () => {
      mockSearchForVideo.mockResolvedValue([]);

      expect(await getYouTubeVideo('invalidSongId')).toBeUndefined();
    });

    it('should return a not allowed status for too many results', async () => {
      const mockVideos = [
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

      mockSearchForVideo.mockResolvedValue(mockVideos);

      expect(await getYouTubeVideo('multipleResultsSongId')).toEqual({
        failedRule: 'Too many results'
      });
    });
  });

  describe('createResponse', () => {
    it('should return a 200 response with a song info for a successful lookup', () => {
      const songRequestResult = {
        songInfo: {
          youtubeId: 'validSongId',
          title: 'Valid Song',
          length: 210
        }
      };

      const response = createResponse(songRequestResult);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(songRequestResult.songInfo);
    });

    it('should return a 400 response with an error for a failed rule', () => {
      const songRequestResult = {
        failedRule: 'Invalid song ID'
      };

      const response = createResponse(songRequestResult);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        code: 400,
        message: 'Invalid song request for ID',
        error: [songRequestResult.failedRule]
      });
    });

    it('should return a 404 response with an error for an undefined result', () => {
      const response = createResponse();

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        code: 404,
        message: 'No result found',
        error: ['No request found for ID']
      });
    });

    it('should return a 500 response for an unexpected error', () => {
      const songRequestResult = {
        error: new Error('Unexpected error')
      };

      const response = createResponse(songRequestResult);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        code: 500,
        message: 'Song request lookup failed'
      });
    });
  });
});
