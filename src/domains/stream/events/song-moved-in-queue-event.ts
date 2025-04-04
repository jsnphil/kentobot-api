import { DomainEvent } from '../../domain-event';
import { StreamEvent } from '../../../types/event-types';

export class SongMovedInQueueEvent extends DomainEvent {
  constructor(
    public readonly songId: string,
    public readonly newPosition: number
  ) {
    super(StreamEvent.SONG_MOVED);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected serialize(): Record<string, any> {
    return {
      songId: this.songId,
      newPosition: this.newPosition
    };
  }
}
