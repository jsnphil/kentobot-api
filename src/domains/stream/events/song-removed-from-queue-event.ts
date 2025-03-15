import { DomainEvent } from '../../domain-event';
import { Song } from '../../song/models/song';

export class SongRemovedFromQueue extends DomainEvent {
  constructor(public readonly songId: string) {
    super('song-added-to-queue');
  }

  protected serialize(): Record<string, any> {
    return {
      songId: this.songId
    };
  }
}
