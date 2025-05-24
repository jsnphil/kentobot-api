import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongBumpedEventPayload } from './event-payload';

export type SongBumpedEvent = KentobotDomainEvent<SongBumpedPayload> & {
  type: 'song-bumped';
  payload: SongBumpedPayload;
  source: 'stream';
  version: 1;
};
