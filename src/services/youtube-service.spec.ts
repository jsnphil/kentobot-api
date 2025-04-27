import { mockClient } from 'aws-sdk-client-mock';
import { YouTubeService } from './youtube-service';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

describe('YouTubeService', () => {
  const ssmMock = mockClient(SSMClient);

  describe('getVideo - validations', () => {
    beforeEach(() => {
      ssmMock
        .on(GetParameterCommand, {
          Name: 'youtube-api-key',
          WithDecryption: true
        })
        .resolves({ Parameter: { Value: 'api-key' } });
    });

    afterEach(() => {
      ssmMock.reset();
    });

    it('should return a video result', async () => {
      const result = await YouTubeService.getVideo('test1');
      expect(result).toEqual({
        id: 'test1',
        title: 'Video title',
        duration: 150,
        isLive: false,
        isPublic: true,
        availableInUS: true,
        isEmbeddable: true
      });
    });

    it('should throw an error if video is not found', async () => {
      await expect(YouTubeService.getVideo('test2')).rejects.toThrow(
        'Video not found'
      );
    });

    it('should throw an error if multiple videos are found', async () => {
      await expect(YouTubeService.getVideo('test4')).rejects.toThrow(
        'Multiple videos found'
      );
    });

    it('should throw an error for invalid duration format', async () => {
      await expect(YouTubeService.getVideo('test5')).rejects.toThrow(
        'Invalid YouTube duration format'
      );
    });

    it('should return a video with availableInUS as true if region restriction is not present', async () => {
      const result = await YouTubeService.getVideo('test3');
      expect(result).toEqual({
        id: 'test3',
        title: 'Video title',
        duration: 150,
        isLive: false,
        isPublic: true,
        availableInUS: true,
        isEmbeddable: true
      });
    });
  });
});
