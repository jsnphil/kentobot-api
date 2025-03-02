import { Logger } from '@aws-lambda-powertools/logger';
import { SongBumpRepository } from '../repositories/song-bump-repository';
import { BumpType, ValidationResult } from '../types/song-request';
import { SongQueue } from '../song-queue';

export class BumpService {
  private readonly logger = new Logger({ serviceName: 'song-bump-service' });
  private bumpRepository = new SongBumpRepository();

  constructor() {
    this.logger.info('Initializing bump service');
  }

  async isBumpAllowed(
    user: string,
    bumpType: BumpType,
    modAllowed?: boolean
  ): Promise<ValidationResult<any>> {
    this.logger.debug(`Checking if ${bumpType} bump is allowed for ${user}`);
    const { bumpedUsers, beanBumpsAvailable, channelPointBumpsAvailable } =
      await this.bumpRepository.getBumpData();

    const bumpChecks = [
      {
        code: 'NO_BUMPS_AVAILABLE',
        name: 'No bumps available',
        fn: () => {
          if (bumpType === BumpType.Bean) {
            return beanBumpsAvailable > 0;
          } else if (bumpType === BumpType.ChannelPoints) {
            return channelPointBumpsAvailable > 0;
          } else {
            return true;
          }
        }
      },
      {
        code: 'FREE_BUMP_NOT_ELIGIBLE',
        name: 'User is not eligible for a free bump',
        fn: () => {
          if (
            bumpType === BumpType.Bean ||
            bumpType === BumpType.ChannelPoints
          ) {
            return (
              bumpedUsers.filter(
                (bumpedUser) =>
                  bumpedUser.user === user &&
                  (bumpedUser.type === BumpType.ChannelPoints ||
                    bumpedUser.type === BumpType.Bean)
              ).length === 0
            );
          } else {
            return true;
          }
        }
      },
      {z
        code: 'PAID_BUMP_NOT_ELIGIBLE',
        name: 'User is not eligible for a paid bump',
        fn: () => {
          if (
            bumpType === BumpType.Bean ||
            bumpType === BumpType.ChannelPoints
          ) {
            return (
              bumpedUsers.filter(
                (bumpedUser) =>
                  bumpedUser.user === user &&
                  (bumpedUser.type === BumpType.Sub ||
                    bumpedUser.type === BumpType.GiftedSub ||
                    BumpType.Bits)
              ).length === 0
            );
          } else {
            return true;
          }
        }
      }
    ];

    let errors: { code: string; message: string }[] = [];

    for (const check of bumpChecks) {
      if (!check.fn()) {
        console.log('Check failed: ', check);
        errors.push({
          code: check.code,
          message: check.name
        });
      }
    }

    if (errors.length == 0 || modAllowed) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        errors
      };
    }
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

  // TODO Rename to setBumpExpiration
  async redeemBump(user: string, type: BumpType) {
    const now = new Date();

    if (type === BumpType.Bean) {
      const bumpTTL = new Date(now.setDate(now.getDate() + 6)).getTime();
      await this.bumpRepository.updateRedeemedBeanBumpData(user, bumpTTL);
    } else {
      const bumpTTL = new Date(now.setDate(now.getDate() + 1)).getTime();
      await this.bumpRepository.updateRedeemedChannelPointsBumpData(
        user,
        bumpTTL
      );
    }
  }

  /* istanbul ignore next */
  async resetBumpCounts() {
    await this.bumpRepository.resetBumpCounts('3'); // Future enhancement - get this from parameter store
  }
}
