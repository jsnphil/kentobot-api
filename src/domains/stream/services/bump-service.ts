import { BumpType } from '../../../types/song-request';

export class BumpService {
  public async isUserEligible(user: string, bumpType: BumpType) {
    return false;
  }
}
