import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Snippet, Status } from '../types/youtube';
import { mockClient } from 'aws-sdk-client-mock';
import * as songRules from './song-request-rules';

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
});
