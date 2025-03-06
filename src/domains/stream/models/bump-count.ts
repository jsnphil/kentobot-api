export class BumpCount {
  private _remainingBumps: number;

  constructor() {
    this._remainingBumps = 0; // Initial count of bumps (could be reset at start of stream)
  }

  get remainingBumps(): number {
    return this._remainingBumps;
  }

  set remainingBumps(count: number) {
    this._remainingBumps = count;
  }

  // Method to decrement bump count when a bump is used
  useBump(): boolean {
    if (this._remainingBumps > 0) {
      this._remainingBumps -= 1;
      return true;
    }
    return false;
  }

  // Method to reset bump counts (e.g., at the start of a new stream)
  resetBumps(): void {
    this._remainingBumps = 0;
  }
}
