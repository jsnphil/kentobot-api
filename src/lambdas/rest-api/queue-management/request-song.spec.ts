import { APIGatewayEvent } from 'aws-lambda';
import { createResponse, findRequestedSong, getSongId } from './request-song';
import { VideoListItem } from '../../../types/youtube';
import { SongRepository } from '../../../repositories/song-repository';
import { YouTubeClient } from '../../../utils/youtube-client';
import { YouTubeErrorCode } from '../../../types/song-request';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';

jest.mock('../../../utils/youtube-client');
jest.mock('../../../repositories/song-repository');
const ssmMock = mockClient(SSMClient);

describe('Request Song', () => {
  describe('findRequestedSong', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      ssmMock
        .on(GetParameterCommand, {
          Name: 'youtube-api-key',
          WithDecryption: true
        })
        .resolves({ Parameter: { Value: 'api-key' } });
    });

    it('should return a valid song when found in the database', async () => {
      jest.spyOn(SongRepository.prototype, 'getSongInfo').mockResolvedValue({
        title: 'Existing Song',
        youtubeId: 'validSongId',
        length: 210,
        playCount: 10
      });

      expect(await findRequestedSong('validSongId')).toEqual({
        success: true,
        data: {
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

      ssmMock
        .on(GetParameterCommand, {
          Name: 'youtube-api-key',
          WithDecryption: true
        })
        .resolves({ Parameter: { Value: 'api-key' } });

      const mockVideo = {
        id: 'validSongId',
        snippet: { title: 'Valid Song' },
        contentDetails: { duration: 'PT3M30S' }
      } as any as VideoListItem;

      jest.spyOn(YouTubeClient.prototype, 'getVideo').mockResolvedValue({
        success: true,
        data: mockVideo
      });

      expect(await findRequestedSong('validSongId')).toEqual({
        success: true,
        data: {
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

      jest.spyOn(YouTubeClient.prototype, 'getVideo').mockResolvedValue({
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_NOT_FOUND,
            message: 'Video not found'
          }
        ]
      });

      expect(await findRequestedSong('invalidSongId')).toEqual({
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_NOT_FOUND,
            message: 'Video not found'
          }
        ]
      });
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

  describe('createResponse', () => {
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
