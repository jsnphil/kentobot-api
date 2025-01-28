import { SongBumpRepository } from '../repositories/song-bump-repository';
import { SongQueueRepository } from '../repositories/song-queue-repository';
import { SongQueue } from '../song-queue';
import { BumpService } from './bump-service';

let bumpService: BumpService;

describe('BumpService', () => {
  beforeEach(() => {
    bumpService = new BumpService();
    jest.resetAllMocks();
  });

  describe('isBumpAllowed', () => {
    it('should return success if user is eligible for a bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          bumpsAvailable: 1,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed('user1');

      expect(result.success).toBe(true);
    });

    it('should return error if user is not eligible for a bump', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          bumpsAvailable: 1,
          bumpedUsers: ['user1']
        });

      const result = await bumpService.isBumpAllowed('user1');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('USER_NOT_ELIGIBLE');
    });

    it('should return error if no bumps are available', async () => {
      const getBumpDataSpy = jest
        .spyOn(SongBumpRepository.prototype, 'getBumpData')
        .mockResolvedValue({
          bumpsAvailable: 0,
          bumpedUsers: []
        });

      const result = await bumpService.isBumpAllowed('user1');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].code).toBe('NO_BUMPS_AVAILABLE');
    });
  });

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
      expect(position).toBe(2);
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
      expect(position).toBe(0);
    });
  });
});
