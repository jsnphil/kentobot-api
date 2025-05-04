import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { UserEnteredInShufflePayload } from './event-payload';

export type UserEnteredInShuffleEvent =
  KentobotDomainEvent<UserEnteredInShufflePayload> & {
    type: 'user-entered-in-shuffle';
    payload: UserEnteredInShufflePayload;
    version: 1;
  };
