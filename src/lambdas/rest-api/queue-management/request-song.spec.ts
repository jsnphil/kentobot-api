import { APIGatewayEvent } from 'aws-lambda';
import {
  createErrorResponse,
  findRequestedSong,
  getSongId,
  handler
} from './request-song';
import { VideoListItem } from '../../../types/youtube';
import { SongRepository } from '../../../repositories/song-repository';
import { YouTubeClient } from '../../../utils/youtube-client';
import { YouTubeErrorCode } from '../../../types/song-request';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { mockSingleResult } from '../../../mocks/mock-youtube-results';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { SongQueueRepository } from '../../../repositories/song-queue-repository';

// jest.mock('../../../utils/youtube-client');
jest.mock('../../../repositories/song-repository');
const ssmMock = mockClient(SSMClient);
const mockDynamoDBClient = mockClient(DynamoDBClient);

describe('Request Song', () => {
  describe('findRequestedSong', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.resetModules();

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

    it('should throw an error if there is a system error', () => {
      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockRejectedValue(new Error('System failure'));

      expect(findRequestedSong('validSongId')).rejects.toThrow(
        'System failure looking up song'
      );
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

  describe('createErrorResponse', () => {
    it('should return a 404 error response for a video not found error', () => {
      const requestSongResult = {
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_NOT_FOUND,
            message: 'Video not found'
          }
        ]
      };

      expect(createErrorResponse(requestSongResult)).toEqual({
        statusCode: 404,
        body: JSON.stringify({
          code: 404,
          message: 'Video not found'
        })
      });
    });

    it('should return a 400 error response for a bad request error', () => {
      const requestSongResult = {
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.MULTIPLE_RESULTS,
            message: 'Too many results'
          }
        ]
      };

      expect(createErrorResponse(requestSongResult)).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'Too many results'
        })
      });
    });
  });

  describe('handler', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      process.env.MAX_SONGS_PER_USER = 'max-songs';
      process.env.REQUEST_DURATION_NAME = 'request-duration';

      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: undefined
      });

      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockResolvedValue(undefined);

      ssmMock
        .on(GetParameterCommand, {
          Name: 'youtube-api-key',
          WithDecryption: true
        })
        .resolves({ Parameter: { Value: 'api-key' } });
    });

    it('should return an error response for a invalid song request', async () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({ youtubeId: 'songId', requestedBy: 'user' })
      } as any;

      jest.spyOn(YouTubeClient.prototype, 'getVideo').mockResolvedValue({
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_NOT_FOUND,
            message: 'Video not found'
          }
        ]
      });

      expect(await handler(event)).toEqual({
        statusCode: 404,
        body: JSON.stringify({
          code: 404,
          message: 'Video not found'
        })
      });
    });

    it('should return an error for a song that could not be added to the queue', async () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({ youtubeId: 'songId', requestedBy: 'user' })
      } as any;

      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockResolvedValue(undefined);

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.MAX_SONGS_PER_USER
        })
        .resolves({ Parameter: { Value: '1' } });

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.REQUEST_DURATION_NAME
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      jest.spyOn(YouTubeClient.prototype, 'getVideo').mockResolvedValue({
        success: true,
        data: {
          id: 'songId',
          snippet: {
            title: 'Song Title',
            publishedAt: '',
            channelId: '',
            description: '',
            thumbnails: {} as any,
            channelTitle: '',
            tags: [],
            categoryId: '',
            liveBroadcastContent: '',
            localized: {} as any,
            defaultAudioLanguage: ''
          },
          contentDetails: {
            duration: 'PT7M30S',
            dimension: '',
            definition: '',
            caption: '',
            licensedContent: false,
            regionRestriction: {
              allowed: ['US ']
            },
            contentRating: {} as any,
            projection: ''
          },
          name: undefined,
          kind: '',
          etag: '',
          status: {} as any
        }
      });

      expect(await handler(event)).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: 'Song length must be under 6:00'
        })
      });
    });

    it('should return a successful response for a valid song request', async () => {
      const event: APIGatewayEvent = {
        body: JSON.stringify({ youtubeId: 'songId', requestedBy: 'user' })
      } as any;

      jest
        .spyOn(SongRepository.prototype, 'getSongInfo')
        .mockResolvedValue(undefined);

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.MAX_SONGS_PER_USER
        })
        .resolves({ Parameter: { Value: '1' } });

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.REQUEST_DURATION_NAME
        })
        .resolves({
          Parameter: {
            Value: '360'
          }
        });

      const saveQueue = jest.spyOn(SongQueueRepository.prototype, 'saveQueue');

      jest.spyOn(YouTubeClient.prototype, 'getVideo').mockResolvedValue({
        success: true,
        data: {
          id: 'songId',
          snippet: {
            title: 'Song Title',
            publishedAt: '',
            channelId: '',
            description: '',
            thumbnails: {} as any,
            channelTitle: '',
            tags: [],
            categoryId: '',
            liveBroadcastContent: '',
            localized: {} as any,
            defaultAudioLanguage: ''
          },
          contentDetails: {
            duration: 'PT2M30S',
            dimension: '',
            definition: '',
            caption: '',
            licensedContent: false,
            regionRestriction: {
              allowed: ['US ']
            },
            contentRating: {} as any,
            projection: ''
          },
          name: undefined,
          kind: '',
          etag: '',
          status: {} as any
        }
      });

      expect(await handler(event)).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          code: 200,
          message: 'Song added to queue',
          song: {
            youtubeId: 'songId',
            title: 'Song Title',
            length: 150,
            playCount: 0
          }
        })
      });
      expect(saveQueue).toHaveBeenCalled();
    });
  });
});
