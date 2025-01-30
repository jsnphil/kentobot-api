import { Logger } from '@aws-lambda-powertools/logger';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SongBumpRepository } from '../repositories/song-bump-repository';
import { ValidationResult } from '../types/song-request';
import { SongQueue } from '../song-queue';

export class BumpService {
  private readonly logger = new Logger({ serviceName: 'song-bump-service' });
  private bumpRepository = new SongBumpRepository();

  constructor() {
    this.logger.info('Initializing bump service');
  }

  async isBumpAllowed(user: string): Promise<ValidationResult<any>> {
    const bumpData = await this.bumpRepository.getBumpData();

    const bumpChecks = [
      {
        code: 'NO_BUMPS_AVAILABLE',
        name: 'No bumps available',
        fn: () => bumpData.bumpsAvailable > 0
      },
      {
        code: 'USER_NOT_ELIGIBLE',
        name: 'User is not eligible for a bump',
        fn: () => !bumpData.bumpedUsers.includes(user)
      }
    ];

    for (const check of bumpChecks) {
      if (!check.fn()) {
        return {
          success: false,
          errors: [
            {
              code: check.code,
              message: check.name
            }
          ]
        };
      }
    }

    return {
      success: true
    };
  }

  getBumpPosition(songQueue: SongQueue): number {
    const queueArray = songQueue.toArray();
    console.log(queueArray);

    let i = 0;
    for (let i = 0; i < queueArray.length; i++) {
      if (!queueArray[i].isBumped) {
        return i + 1;
      }
    }

    return 1;
  }

  async updateBumpData(user: string) {
    const now = new Date();
    const bumpTTL = new Date(now.setDate(now.getDate() + 6)).getTime();
    await this.bumpRepository.updateBumpData(user, bumpTTL);
  }
}
