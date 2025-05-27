import { KentobotDomainEvent } from '@core/events/domain-event';

export type SongRemovedFromQueueEventPayload = {
  songId: string;
};

export type SongRemovedFromQueueEvent =
  KentobotDomainEvent<SongRemovedFromQueueEventPayload> & {
    type: 'song-removed-from-queue';
    payload: SongRemovedFromQueueEventPayload;
    source: 'song-queue';
    version: 1;
  };
