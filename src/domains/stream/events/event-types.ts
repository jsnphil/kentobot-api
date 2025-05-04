export type SongAddedToQueuePayload = {
  type: 'song-added-to-queue';
  source: 'song-queue';
};

export type SongRemovedFromQueuePayload = {
  type: 'song-removed-from-queue';
  source: 'song-queue';
};

export type SongMovedInQueuePayload = {
  type: 'song-moved-in-queue';
  source: 'song-queue';
};

export type SongBumpedPayload = {
  type: 'song-bumped';
  source: 'song-queue';
};

export type SongPlayedPayload = {
  type: 'song-played';
  source: 'song-queue';
};


