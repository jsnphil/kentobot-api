export class ShuffleSession {
  private shuffleEntries: string[] = []; // List of users who have entered shuffle mode
  private shuffleMode: boolean = false; // Flag to indicate if shuffle mode is active
  private shuffleOpened: boolean = false; // Flag to indicate if shuffle mode is opened
  private userCooldown: string[] = []; // List of users who are blocked from entering shuffle mode

  constructor(
    shuffleEntries: string[] = [],
    shuffleMode: boolean = true,
    shuffleOpened: boolean = false,
    userCooldown: string[] = []
  ) {
    this.shuffleEntries = shuffleEntries;
    this.shuffleMode = shuffleMode;
    this.shuffleOpened = shuffleOpened;
  }

  public static load(data: any): ShuffleSession {
    const session = new ShuffleSession(
      data.shuffleEntries,
      data.shuffleMode,
      data.shuffleOpened,
      data.userCooldown
    );

    return session;
  }

  public getShuffleEntries(): string[] {
    return this.shuffleEntries;
  }

  public getShuffleMode(): boolean {
    return this.shuffleMode;
  }

  public getShuffleOpened(): boolean {
    return this.shuffleOpened;
  }
}
