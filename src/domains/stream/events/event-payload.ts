import { BumpType } from '../../../types/song-request';

export type SongAddedToQueueEventPayload = {
  songId: string;
  requestedBy: string;
  title: string;
  duration: number;
};

export type SongRemovedFromQueueEventPayload = {
  songId: string;
};

export type SongMovedInQueueEventPayload = {
  songId: string;
  newPosition: number;
};

export type SongBumpedEventPayload = {
  songId: string;
  bumpPosition: number;
  bumpType: BumpType;
};

export type SongPlayedEventPayload = {
  songId: string;
  requestedBy: string;
  title: string;
  duration: number;
  playedAt: string;
};
