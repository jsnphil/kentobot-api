import { StreamEvent } from '../../../types/event-types';
import { DomainEvent } from '../../domain-event';

export class SongEnteredInShuffleEvent extends DomainEvent {
  constructor(public readonly songId: string, public readonly user: string) {
    super(StreamEvent.SONG_ENTERED_IN_SHUFFLE);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected serialize(): Record<string, any> {
    return {
      songId: this.songId,
      user: this.user
    };
  }
}
