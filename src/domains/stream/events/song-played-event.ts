import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongPlayedPayload } from './event-payload';

export type SongPlayedEvent = KentobotDomainEvent<SongPlayedPayload> & {
  type: 'song-played';
  source: 'stream';
  version: 1;
};
