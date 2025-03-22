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

  describe('updateUserBumpEligiblity', () => {
    it('should update user bump eligibility with a new expiration date', async () => {
      // Arrange
      const user = 'user';
      const expiration = new Date();
      expiration.setDate(new Date().getDate() + 7);

      const updateUserBumpEligibilitySpy = jest
        .spyOn(BumpRepository, 'updateUserBumpEligibility')
        .mockResolvedValue(undefined);

      const bumpService = new BumpService();
      // Act
      await bumpService.updateUserBumpEligiblity(user);
      // Assert
      expect(updateUserBumpEligibilitySpy).toHaveBeenCalledWith(
        user,
        expiration.toISOString()
      );
    });

    it('should handle errors when updating user bump eligibility', async () => {
      // Arrange
      const user = 'user';
      const error = new Error('Failed to update eligibility');

      jest
        .spyOn(BumpRepository, 'updateUserBumpEligibility')
        .mockRejectedValue(error);

      const bumpService = new BumpService();
      // Act & Assert
      await expect(bumpService.updateUserBumpEligiblity(user)).rejects.toThrow(
        'Failed to update eligibility'
      );
    });
  });
});
