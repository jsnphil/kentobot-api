import { DomainEvent } from '../../domain-event';

export class SongMovedInQueueEvent extends DomainEvent {
  constructor(
    public readonly songId: string,
    public readonly newPosition: number
  ) {
    super('song-moved-in-queue');
  }

  protected serialize(): Record<string, any> {
    return {
      songId: this.songId,
      newPosition: this.newPosition
    };
  }
}
