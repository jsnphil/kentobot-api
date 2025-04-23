import { ShuffleEntry } from './shuffle-entry';

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

  private entries: ShuffleEntry[] = [];
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
    entries: ShuffleEntry[],
    isOpen: boolean,
    previousWinners: User[]
  ) {
    const shuffle = new Shuffle(streamId, openedAt, previousWinners);
    shuffle.entries = entries;
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

    const existingEntry = this.entries.find(
      (entry) => entry.getUser() === user
    );

    if (existingEntry) {
      throw new Error('User already entered.');
    }

    this.entries.push(new ShuffleEntry(user, songId));
  }

  close(): void {
    this.open = false;
  }

  selectWinner(): ShuffleEntry | null {
    if (this.isOpen) {
      this.close();
    }

    if (this.entries.length === 0) {
      return null;
    }

    const winner =
      this.entries[Math.floor(Math.random() * this.entries.length)];

    this.previousWinners.push(winner.getUser());

    return winner;
  }

  getWinner(): ShuffleParticipant | null {
    return this.winner;
  }

  getEntries() {
    return this.entries;
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
