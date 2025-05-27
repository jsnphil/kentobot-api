import { KentobotDomainEvent } from '@core/events/domain-event';

export type SongMovedInQueueEventPayload = {
  songId: string;
  newPosition: number;
};

export type SongMovedInQueueEvent =
  KentobotDomainEvent<SongMovedInQueueEventPayload> & {
    type: 'song-moved-in-queue';
    payload: SongMovedInQueueEventPayload;
    source: 'song-queue';
    version: 1;
  };
