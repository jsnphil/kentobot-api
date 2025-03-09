import { DomainEvent } from '../../domain-event';
import { Song } from '../../song/models/song';

export class SongAddedToQueueEvent extends DomainEvent {
  constructor(public readonly song: Song) {
    super('song-added-to-queue');
  }

  protected serialize(): Record<string, any> {
    return {
      songId: this.song.id,
      title: this.song.title,
      requestedBy: this.song.requestedBy,
      status: this.song.status,
      duration: this.song.duration
    };
  }
}
