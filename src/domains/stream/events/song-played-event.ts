import { DomainEvent } from '../../domain-event';

export class SongPlayedEvent extends DomainEvent {
  constructor(
    public readonly songId: string,
    public readonly requestedBy: string,
    public readonly songTitle: string,
    public readonly duration: number,
    public readonly playedOn: Date
  ) {
    super('song-played');
  }

  protected serialize(): Record<string, any> {
    return {
      songId: this.songId,
      requestedBy: this.requestedBy,
      songTitle: this.songTitle,
      duration: this.duration,
      playedOn: this.playedOn.toISOString()
    };
  }
}
