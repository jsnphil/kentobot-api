type User = string;
type StreamId = string;

// TODO Turn this into a model
interface ShuffleParticipant {
  user: User;
  songId: string;
}

export class Shuffle {
  private readonly streamId: StreamId;
  private openedAt: Date;
  private durationMs: number = 60000;

  private participants: Map<User, ShuffleParticipant> = new Map();
  private previousWinners: User[] = [];
  private winner: ShuffleParticipant | null = null;
  private open = false;

  constructor(
    streamId: StreamId,
    openedAt: Date,
    previousWinners: User[] = []
  ) {
    this.streamId = streamId;
    this.openedAt = openedAt;
    this.previousWinners = previousWinners;
  }

  static create(
    streamId: StreamId,
    openedAt: Date,
    previousWinners: User[] = []
  ): Shuffle {
    return new Shuffle(streamId, openedAt, previousWinners);
  }

  static load(
    streamId: StreamId,
    openedAt: Date,
    participants: Map<User, ShuffleParticipant>,
    isOpen: boolean = false
  ) {
    const shuffle = new Shuffle(streamId, openedAt);
    shuffle.participants = participants;
    shuffle.open = isOpen;
    return shuffle;
  }

  start(): void {
    if (this.isOpen) {
      throw new Error('Shuffle is already open.');
    }

    this.open = true;
    this.openedAt = new Date();
  }

  get isOpen(): boolean {
    return this.open && Date.now() < this.openedAt.getTime() + this.durationMs;
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
    this.open = false;
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

  getAllParticipants() {
    return this.participants;
  }

  getCountdownRemaining(): number {
    const remaining = this.openedAt.getTime() + this.durationMs - Date.now();
    return Math.max(0, remaining);
  }

  /* istanbul ignore next */
  getStreamId(): StreamId {
    return this.streamId;
  }

  /* istanbul ignore next */
  getOpenedAt(): Date {
    return this.openedAt;
  }

  /* istanbul ignore next */
  getPreviousWinners(): User[] {
    return this.previousWinners;
  }
}
