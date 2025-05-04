import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongAddedToQueuePayload } from './event-payload';

export type SongAddedToQueueEvent =
  KentobotDomainEvent<SongAddedToQueuePayload> & {
    type: 'song-added-to-queue';
    payload: SongAddedToQueuePayload;
    version: 1;
  };
