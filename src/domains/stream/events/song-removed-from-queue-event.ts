import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongRemovedFromQueuePayload } from './event-payload';

export type SongRemovedFromQueueEvent =
  KentobotDomainEvent<SongRemovedFromQueuePayload> & {
    type: 'song-removed-from-queue';
    payload: SongRemovedFromQueuePayload;
    version: 1;
  };
