import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Snippet, Status, VideoListItem } from '../types/youtube';
import { mockClient } from 'aws-sdk-client-mock';
import * as songRules from './song-request-rules';
import { YouTubeErrorCode } from '../types/song-request';

beforeEach(() => {
  jest.resetAllMocks;
  jest.clearAllMocks;
});

describe('song-request-rules', () => {
  describe('isEmbeddable', () => {
    it('should return true if the status is embeddable', () => {
      const status: Status = {
        embeddable: true,
        uploadStatus: '',
        failureReason: '',
        rejectionReason: '',
        privacyStatus: '',
        license: '',
        publicStatsViewable: false,
        madeForKids: false
      };

      const result = songRules.isEmbeddable(status);
      expect(result).toBe(true);
    });

    it('should return false if the status is not embeddable', () => {
      const status: Status = {
        embeddable: false,
        uploadStatus: '',
        failureReason: '',
        rejectionReason: '',
        privacyStatus: '',
        license: '',
        publicStatsViewable: false,
        madeForKids: false
      };

      const result = songRules.isEmbeddable(status);
      expect(result).toBe(false);
    });
  });

  describe('isPublicVideo', () => {
    const ssmMock = mockClient(SSMClient);
    beforeEach(() => {
      ssmMock.reset();
    });

    it('should return true if the video is public', async () => {
      const status: Status = {
        embeddable: false,
        uploadStatus: '',
        failureReason: '',
        rejectionReason: '',
        privacyStatus: 'public',
        license: '',
        publicStatsViewable: false,
        madeForKids: false
      };

      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'true' } });

      const result = await songRules.isPublicVideo(status);
      expect(result).toBe(true);
    });

    it('should return false if the video is not public', async () => {
      const status: Status = {
        embeddable: false,
        uploadStatus: '',
        failureReason: '',
        rejectionReason: '',
        privacyStatus: 'private',
        license: '',
        publicStatsViewable: false,
        madeForKids: false
      };

      const ssmMock = mockClient(SSMClient);
      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'true' } });

      const result = await songRules.isPublicVideo(status);
      expect(result).toBe(false);
    });

    it('should return true if the video is not public and the public rule is disabled', async () => {
      const status: Status = {
        embeddable: false,
        uploadStatus: '',
        failureReason: '',
        rejectionReason: '',
        privacyStatus: 'private',
        license: '',
        publicStatsViewable: false,
        madeForKids: false
      };

      const ssmMock = mockClient(SSMClient);
      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'false' } });

      const result = await songRules.isPublicVideo(status);
      expect(result).toBe(true);
    });
  });

  describe('isLivestream', () => {
    it('should return false if the video is not a livestream', () => {
      const snippet = {
        liveBroadcastContent: 'live'
      } as any;

      const result = songRules.isLivestream(snippet);
      expect(result).toBe(false);
    });

    it('should return true if the video is not a livestream', () => {
      const snippet = {
        liveBroadcastContent: 'none'
      } as any;

      const result = songRules.isLivestream(snippet);
      expect(result).toBe(true);
    });
  });

  describe('validRegion', () => {
    it('should return true if the video is available in the US', () => {
      const regionRestriction = {
        allowed: ['US']
      } as any;

      const result = songRules.validRegion(regionRestriction);
      expect(result).toBe(true);
    });

    it('should return false if the video is not available in the US', () => {
      const regionRestriction = {
        allowed: ['CA']
      } as any;

      const result = songRules.validRegion(regionRestriction);
      expect(result).toBe(false);
    });
  });

  describe('isLicensed', () => {
    const ssmMock = mockClient(SSMClient);
    beforeEach(() => {
      ssmMock.reset();
    });

    it('should return true if the video is licensed and the license check is on', async () => {
      const contentDetails = {
        licensedContent: true
      } as any;

      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'true' } });

      const result = await songRules.isLicensed(contentDetails);
      expect(result).toBe(true);
    });

    it('should return true if the video not is licensed and the license check is off', async () => {
      const contentDetails = {
        licensedContent: false
      } as any;

      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'false' } });

      const result = await songRules.isLicensed(contentDetails);
      expect(result).toBe(true);
    });

    it('should return false if the video is not licensed and the license check is on', async () => {
      const contentDetails = {
        licensedContent: false
      } as any;

      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: 'true' } });

      const result = await songRules.isLicensed(contentDetails);
      expect(result).toBe(false);
    });
  });

  describe('isValidDuration', () => {
    const ssmMock = mockClient(SSMClient);
    beforeEach(() => {
      ssmMock.reset();
    });

    it('should return true if the video is less than the allowed length', async () => {
      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: '360' } });

      const duration = 'PT3M30S'; // 3 minutes, 30 seconds

      expect(await songRules.validDuration(duration)).toBe(true);
    });

    it('should return false if the video is more than the allowed length', async () => {
      ssmMock
        .on(GetParameterCommand, {})
        .resolves({ Parameter: { Value: '360' } });

      const duration = 'PT6M30S'; // 6 minutes, 30 seconds

      expect(await songRules.validDuration(duration)).toBe(false);
    });
  });

  describe('checkYouTubeRules', () => {
    const ssmMock = mockClient(SSMClient);
    beforeEach(() => {
      ssmMock.reset();

      process.env.PUBLIC_VIDEO_TOGGLE_NAME = 'public-video-toggle';
      process.env.REQUEST_DURATION_NAME = 'request-duration';
      process.env.LICENSED_VIDEO_TOGGLE_NAME = 'licensed-video-toggle';
    });

    it('should return true if all rules pass', async () => {
      ssmMock
        .on(GetParameterCommand, { Name: process.env.PUBLIC_VIDEO_TOGGLE_NAME })
        .resolves({ Parameter: { Value: 'true' } });

      ssmMock
        .on(GetParameterCommand, { Name: process.env.REQUEST_DURATION_NAME })
        .resolves({ Parameter: { Value: '360' } });

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.LICENSED_VIDEO_TOGGLE_NAME
        })
        .resolves({ Parameter: { Value: 'true' } });

      const video = {
        status: {
          embeddable: true,
          uploadStatus: '',
          failureReason: '',
          rejectionReason: '',
          privacyStatus: 'public',
          license: '',
          publicStatsViewable: false,
          madeForKids: false
        },
        snippet: {
          liveBroadcastContent: 'none'
        },
        contentDetails: {
          licensedContent: true,
          regionRestriction: {
            allowed: ['US']
          },
          duration: 'PT3M30S'
        }
      } as unknown as VideoListItem;

      const result = await songRules.checkYouTubeRules(video);

      expect(result).toEqual({
        success: true,
        data: video
      });
    });

    it('should return false if any rules fail', async () => {
      ssmMock
        .on(GetParameterCommand, { Name: process.env.PUBLIC_VIDEO_TOGGLE_NAME })
        .resolves({ Parameter: { Value: 'true' } });

      ssmMock
        .on(GetParameterCommand, { Name: process.env.REQUEST_DURATION_NAME })
        .resolves({ Parameter: { Value: '100' } });

      ssmMock
        .on(GetParameterCommand, {
          Name: process.env.LICENSED_VIDEO_TOGGLE_NAME
        })
        .resolves({ Parameter: { Value: 'true' } });

      const video = {
        status: {
          embeddable: true,
          uploadStatus: '',
          failureReason: '',
          rejectionReason: '',
          privacyStatus: 'public',
          license: '',
          publicStatsViewable: false,
          madeForKids: false
        },
        snippet: {
          liveBroadcastContent: 'none'
        },
        contentDetails: {
          licensedContent: false,
          regionRestriction: {
            allowed: ['US']
          },
          duration: 'PT3M30S'
        }
      } as unknown as VideoListItem;

      const result = await songRules.checkYouTubeRules(video);

      expect(result).toEqual({
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_UNLICENSED,
            message: 'Video is not licensed'
          }
        ]
      });
    });
  });
});
