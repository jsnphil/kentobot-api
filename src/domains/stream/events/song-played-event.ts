import { KentobotDomainEvent } from '../../../core/events/domain-event';
import { SongPlayedEventPayload } from './event-types';

export type SongPlayedEvent = KentobotDomainEvent<SongPlayedPayload> & {
  type: 'song-played';
  source: 'stream';
  version: 1;
};
