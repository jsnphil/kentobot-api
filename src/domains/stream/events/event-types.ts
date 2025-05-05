export const StreamEventType = {
  SONG_PLAYED: 'song-played',
  SONG_ADDED_TO_QUEUE: 'song-added-to-queue',
  SONG_REMOVED_FROM_QUEUE: 'song-removed-from-queue',
  SONG_MOVED_IN_QUEUE: 'song-moved-in-queue',
  SONG_BUMPED: 'song-bumped'
} as const;

export const StreamEventSource = {
  SONG_QUEUE: 'song-queue',
  STREAM: 'stream'
};

export type SongAddedToQueuePayload = {
  type: StreamEventType.SONG_ADDED_TO_QUEUE;
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
