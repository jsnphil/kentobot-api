import { BumpType } from '../../../types/song-request';
import { BumpRepository } from '../repositories/bump-repository';

export class BumpService {
  public async isUserEligible(user: string, bumpType: BumpType) {
    const userEligibility = await BumpRepository.getUserBumpEligibility(user);

    if (!userEligibility) {
      return true;
    }

    const expiration = new Date(userEligibility.bumpExpiration);

    if (new Date() <= expiration) {
      return true;
    }

    return false;
  }
}
