import { BumpType } from '../../../types/song-request';
import { BumpRepository } from '../repositories/bump-repository';
import { BumpService } from './bump-service';

describe('BumpService', () => {
  describe('isUserEligible', () => {
    it('should return true if user is eligible for a bump', async () => {
      // Arrange
      const user = 'user';
      const bumpType = BumpType.Bean;

      const expDate = new Date();
      const bumpExpiration = expDate.setDate(new Date().getDate() + 7);

      const getUserBumpEligibilitySpy = jest
        .spyOn(BumpRepository, 'getUserBumpEligibility')
        .mockResolvedValue({
          user,
          bumpExpiration: new Date(bumpExpiration).toISOString()
        });

      const bumpService = new BumpService();
      // Act
      const result = await bumpService.isUserEligible(user, bumpType);
      // Assert
      expect(result).toBe(true);
      expect(getUserBumpEligibilitySpy).toHaveBeenCalledWith(user);
    });

    it('should return false if user is not eligible for a bump', async () => {
      // Arrange
      const user = 'user';
      const bumpType = BumpType.Bean;

      const expDate = new Date();
      const bumpExpiration = expDate.setDate(new Date().getDate() - 5);

      const getUserBumpEligibilitySpy = jest
        .spyOn(BumpRepository, 'getUserBumpEligibility')
        .mockResolvedValue({
          user,
          bumpExpiration: new Date(bumpExpiration).toISOString()
        });

      const bumpService = new BumpService();
      // Act
      const result = await bumpService.isUserEligible(user, bumpType);
      // Assert
      expect(result).toBe(false);
      expect(getUserBumpEligibilitySpy).toHaveBeenCalledWith(user);
    });

    it('should return true if there is no eligibility record', async () => {
      // Arrange
      const user = 'user';
      const bumpType = BumpType.Bean;

      const expDate = new Date();
      const bumpExpiration = expDate.setDate(new Date().getDate() - 5);

      const getUserBumpEligibilitySpy = jest
        .spyOn(BumpRepository, 'getUserBumpEligibility')
        .mockResolvedValue(undefined);

      const bumpService = new BumpService();
      // Act
      const result = await bumpService.isUserEligible(user, bumpType);
      // Assert
      expect(result).toBe(true);
      expect(getUserBumpEligibilitySpy).toHaveBeenCalledWith(user);
    });
  });
});
