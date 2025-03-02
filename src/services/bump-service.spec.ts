import { SongBumpRepository } from '../repositories/song-bump-repository';
import { SongQueueRepository } from '../repositories/song-queue-repository';
import { SongQueue } from '../song-queue';
import { BumpType } from '../types/song-request';
import { BumpService } from './bump-service';

let bumpService: BumpService;

describe('BumpService', () => {
  beforeEach(() => {
    bumpService = new BumpService();
    jest.resetAllMocks();
  });

  describe('isBumpAllowed - BeanBump', () => {
    it('should return success if user is eligible for a bean bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 1,
          channelPointBumpsAvailable: 1,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed(
        'KaladinStormblessed',
        BumpType.Bean
      );

      expect(result.success).toBe(true);
    });

    it('should return error if user is not eligible for a bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 1,
          channelPointBumpsAvailable: 1,
          bumpedUsers: [
            {
              user: 'KaladinStormblessed',
              expiration: Date.now() + 1000 * 60 * 60, // 1 hour from now
              type: BumpType.Bean
            }
          ]
        });

      const result = await bumpService.isBumpAllowed(
        'KaladinStormblessed',
        BumpType.Bean
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('USER_NOT_ELIGIBLE');
    });

    it('should return false if no bean bumps are available', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 0,
          channelPointBumpsAvailable: 0,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed('user1', BumpType.Bean);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('NO_BUMPS_AVAILABLE');
    });
  });

  describe('isBumpAllowed - ChannelPointBump', () => {
    it('should return success if user is eligible for a channel point bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 1,
          channelPointBumpsAvailable: 1,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed(
        'KaladinStormblessed',
        BumpType.ChannelPoints
      );

      expect(result.success).toBe(true);
    });

    it('should return false if user is not eligible for a channel point bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 1,
          channelPointBumpsAvailable: 1,
          bumpedUsers: [
            {
              user: 'KaladinStormblessed',
              expiration: Date.now() + 1000 * 60 * 60, // 1 hour from now
              type: BumpType.ChannelPoints
            }
          ]
        });

      const result = await bumpService.isBumpAllowed(
        'KaladinStormblessed',
        BumpType.Bean
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('USER_NOT_ELIGIBLE');
    });

    it('should return false if no channel point bumps are available', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 0,
          channelPointBumpsAvailable: 0,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed('user1', BumpType.Bean);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('NO_BUMPS_AVAILABLE');
    });

    it('should return false the user has already used a free bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          beanBumpsAvailable: 1,
          channelPointBumpsAvailable: 1,
          bumpedUsers: [
            {
              user: 'KaladinStormblessed',
              expiration: Date.now() + 1000 * 60 * 60, // 1 hour from now
              type: BumpType.Bean
            }
          ]
        });

      const result = await bumpService.isBumpAllowed(
        'KaladinStormblessed',
        BumpType.ChannelPoints
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('FREE_BUMP_NOT_ELIGIBLE');
    });
  });

  // TODO Add tests for subs, raids, gifts subs, and bits

  describe('getBumpPosition', () => {
    it('should return the correct bump position if there are bumps in the queue', async () => {
      jest
        .spyOn(SongQueueRepository.prototype, 'getQueue')
        .mockResolvedValue([]);
      const songQueue = await SongQueue.loadQueue();

      songQueue.toArray = jest.fn().mockReturnValue([
        {
          youtubeId: '123',
          isBumped: true
        },
        {
          youtubeId: '456',
          isBumped: true
        },
        {
          youtubeId: '789',
          isBumped: false
        }
      ]);

      const position = bumpService.getBumpPosition(songQueue);
      expect(position).toBe(3);
    });

    it('should return the top of the queue if there are no bumps in the queue', async () => {
      jest
        .spyOn(SongQueueRepository.prototype, 'getQueue')
        .mockResolvedValue([]);
      const songQueue = await SongQueue.loadQueue();

      songQueue.toArray = jest.fn().mockReturnValue([
        {
          youtubeId: '123',
          isBumped: false
        },
        {
          youtubeId: '456',
          isBumped: false
        },
        {
          youtubeId: '789',
          isBumped: false
        }
      ]);

      const position = bumpService.getBumpPosition(songQueue);
      expect(position).toBe(1);
    });
  });
});
