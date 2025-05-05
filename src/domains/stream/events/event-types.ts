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

export type StreamEventType =
  (typeof StreamEventType)[keyof typeof StreamEventType];
export type StreamEventSource =
  (typeof StreamEventSource)[keyof typeof StreamEventSource];

export type SongAddedToQueuePayload = {
  type: typeof StreamEventType.SONG_ADDED_TO_QUEUE;
  source: typeof StreamEventSource.SONG_QUEUE;
};

export type SongRemovedFromQueuePayload = {
  type: typeof StreamEventType.SONG_REMOVED_FROM_QUEUE;
  source: typeof StreamEventSource.SONG_QUEUE;
};

export type SongMovedInQueuePayload = {
  type: typeof StreamEventType.SONG_MOVED_IN_QUEUE;
  source: typeof StreamEventSource.SONG_QUEUE;
};

export type SongBumpedPayload = {
  type: typeof StreamEventType.SONG_BUMPED;
  source: typeof StreamEventSource.SONG_QUEUE;
};

export type SongPlayedPayload = {
  type: typeof StreamEventType.SONG_PLAYED;
  source: typeof StreamEventSource.STREAM;
};
