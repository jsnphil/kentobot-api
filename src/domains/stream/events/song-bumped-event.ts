import { DomainEvent } from '../../domain-event';

export class SongBumpedEvent extends DomainEvent {
  constructor(
    public readonly songId: string,
    public readonly position: number
  ) {
    super('song-moved-in-queue');
  }

  protected serialize(): Record<string, any> {
    return {
      songId: this.songId,
      position: this.position
    };
  }
}
