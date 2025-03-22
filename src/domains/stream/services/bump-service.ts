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

  // TODO This be triggered by a Bump event

  public async updateUserBumpEligiblity(user: string) {
    const expiration = new Date();
    expiration.setDate(new Date().getDate() + 7);

    await BumpRepository.updateUserBumpEligibility(
      user,
      expiration.toISOString()
    );
  }
}
