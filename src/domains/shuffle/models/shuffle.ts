type User = string;
type StreamId = string;

interface ShuffleParticipant {
  user: User;
  songId: string;
}

export class Shuffle {
  private readonly streamId: StreamId;
  private readonly openedAt: Date;
  private durationMs: number = 60000;

  private participants: Map<User, ShuffleParticipant> = new Map();
  private previousWinners: User[] = [];
  private winner: ShuffleParticipant | null = null;
  private closed = false;

  constructor(streamId: StreamId, openedAt: Date, previousWinners: User[]) {
    this.streamId = streamId;
    this.openedAt = openedAt;
    this.previousWinners = previousWinners;
  }

  static start(streamId: StreamId, openedAt: Date, previousWinners: User[]) {
    return new Shuffle(streamId, openedAt, previousWinners);
  }

  get isOpen(): boolean {
    return (
      !this.closed && Date.now() < this.openedAt.getTime() + this.durationMs
    );
  }

  join(user: User, songId: string): void {
    if (!this.isOpen) {
      throw new Error('Shuffle is not open.');
    }

    if (this.previousWinners.includes(user)) {
      throw new Error('User is on cooldown.');
    }

    if (this.participants.has(user)) {
      throw new Error('User already entered.');
    }

    this.participants.set(user, { user, songId });
  }

  close(): void {
    this.closed = true;
  }

  selectWinner(): ShuffleParticipant | null {
    if (this.isOpen) {
      this.close();
    }

    if (this.participants.size === 0) {
      return null;
    }

    const entries = Array.from(this.participants.values());
    const winner = entries[Math.floor(Math.random() * entries.length)];
    this.winner = winner;
    return winner;
  }

  getWinner(): ShuffleParticipant | null {
    return this.winner;
  }

  getAllParticipants(): ShuffleParticipant[] {
    return Array.from(this.participants.values());
  }

  getCountdownRemaining(): number {
    const remaining = this.openedAt.getTime() + this.durationMs - Date.now();
    return Math.max(0, remaining);
  }

  isOnCooldown(user: User): boolean {
    return this.previousWinners.includes(user);
  }

  getStreamId(): StreamId {
    return this.streamId;
  }
}
