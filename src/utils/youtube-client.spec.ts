import { mockClient } from 'aws-sdk-client-mock';

import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { YouTubeClient } from './youtube-client';
import { VideoListItem, VideoListResponse } from '../types/youtube';
import { YouTubeErrorCode } from '../types/song-request';
import { checkYouTubeRules } from './song-request-rules';
import fetch from 'jest-mock-fetch';

jest.mock('./song-request-rules');

const mockCheckYouTubeRules = checkYouTubeRules as jest.MockedFunction<
  typeof checkYouTubeRules
>;

const ssmMock = mockClient(SSMClient);

describe('YoutubeClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    ssmMock
      .on(GetParameterCommand, {
        Name: 'youtube-api-key',
        WithDecryption: true
      })
      .resolves({ Parameter: { Value: 'api-key' } });
  });

  afterEach(() => {
    fetch.reset();
  });

  it('should initialize the client', async () => {
    const client = await YouTubeClient.initialize();

    expect(client).toBeDefined();
  });

  describe('validateResult', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should return a failed validation if there is are no videos', async () => {
      const client = await YouTubeClient.initialize();

      const result = await client.validateResult([]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBe(1);

      const error = result.errors![0];
      expect(error).toEqual({
        code: YouTubeErrorCode.VIDEO_NOT_FOUND,
        message: 'Video not found'
      });
    });

    it('should return a failed validation if there is are multiple videos', async () => {
      const client = await YouTubeClient.initialize();

      const result = await client.validateResult([
        {
          id: 'video1',
          name: undefined,
          kind: '',
          etag: '',
          snippet: {} as any,
          contentDetails: {} as any,
          status: {} as any
        },
        {
          id: 'video2',
          name: undefined,
          kind: '',
          etag: '',
          snippet: {} as any,
          contentDetails: {} as any,
          status: {} as any
        }
      ]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBe(1);

      const error = result.errors![0];
      expect(error).toEqual({
        code: YouTubeErrorCode.MULTIPLE_RESULTS,
        message: 'Too many results'
      });
    });

    it('should return a successful validation if the video passes rules', async () => {
      const client = await YouTubeClient.initialize();
      expect(client).toBeDefined();

      const video = {
        contentDetails: {
          regionRestriction: { allowed: ['US'] },
          duration: 'PT1M1S'
        },
        snippet: { liveBroadcastContent: 'none' },
        status: { embeddable: true, publicStatsViewable: true }
      } as any as VideoListItem;

      mockCheckYouTubeRules.mockResolvedValue({ success: true, data: video });

      const result = await client.validateResult([video]);

      console.log(result);

      expect(result).toBeDefined();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual(video);
    });
  });

  describe('searchForVideo', () => {
    it('should return a list of videos', async () => {
      const client = await YouTubeClient.initialize();

      const response: VideoListResponse = {
        kind: 'kind',
        etag: 'etag',
        items: [
          {
            id: 'video1',
            name: undefined,
            kind: '',
            etag: '',
            snippet: {} as any,
            contentDetails: {} as any,
            status: {} as any
          }
        ],
        pageInfo: { totalResults: 1, resultsPerPage: 1 }
      };

      const videos = await client.searchForVideo('test1');

      expect(videos).toBeDefined();
      expect(videos.length).toBe(1);
    });

    it('should return an empty list', async () => {
      const client = await YouTubeClient.initialize();

      const videos = await client.searchForVideo('test2');

      expect(videos).toBeDefined();
      expect(videos.length).toBe(0);
    });
  });
});
