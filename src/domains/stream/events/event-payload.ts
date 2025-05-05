export type SongAddedToQueuePayload = {
  songId: string;
  requestedBy: string;
  title: string;
  duration: number;
};

export type SongRemovedFromQueuePayload = {
  songId: string;
};

export type SongMovedInQueuePayload = {
  songId: string;
  newPosition: number;
};

export type SongBumpedPayload = {
  songId: string;
  bumpPosition: number;
};

export type SongPlayedPayload = {
  songId: string;
  requestedBy: string;
  title: string;
  duration: number;
  playedAt: string;
};
