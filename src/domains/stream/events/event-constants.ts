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
