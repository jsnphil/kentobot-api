import { Logger } from '@aws-lambda-powertools/logger';
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
    this.logger.debug('Checking if bump is allowed');
    const bumpData = await this.bumpRepository.getBumpData();

    console.log(JSON.stringify(bumpData, null, 2));

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

    /* istanbul ignore next */
    return 1; // This can never happen in a real scenario, the queue will never be all bumps
  }

  async redeemBump(user: string) {
    const now = new Date();
    const bumpTTL = new Date(now.setDate(now.getDate() + 6)).getTime();
    await this.bumpRepository.updateRedeemedBumpData(user, bumpTTL);
  }

  /* istanbul ignore next */
  async resetBumpCounts() {
    await this.bumpRepository.resetBumpCounts('3'); // Future enhancement - get this from parameter store
  }
}
