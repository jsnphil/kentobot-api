export class BumpRepository {
  public async updateUserBumpCooldown(user: string): Promise<void> {
    // Here you would typically interact with your user repository to update the bump cooldown
    // For this example, we'll just return void to simulate the update
  }

  public async getUserBumpCooldown(user: string): Promise<number> {
    // Here you would typically interact with your user repository to get the bump cooldown
    // For this example, we'll just return 0 to simulate the cooldown
    return 0;
  }
}
