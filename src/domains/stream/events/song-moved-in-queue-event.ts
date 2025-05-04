import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongMovedInQueuePayload } from './event-payload';

export type SongMovedInQueueEvent =
  KentobotDomainEvent<SongMovedInQueuePayload> & {
    type: 'song-moved-in-queue';
    payload: SongMovedInQueuePayload;
    version: 1;
  };
