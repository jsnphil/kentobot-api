import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongAddedToQueuePayload } from './event-payload';

// TODO Finish and move to shuffle domain
export type UserEnteredInShuffleEvent =
  KentobotDomainEvent<SongAddedToQueuePayload> & {
    type: 'song-added-to-queue';
    payload: SongAddedToQueuePayload;
    source: 'shuffle';
    version: 1;
  };
