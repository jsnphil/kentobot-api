import { SongQueueItem } from '../types/song-request';

export const mockSongQueue: SongQueueItem[] = [
  {
    youtubeId: 'abc123',
    title: 'Song Title 1',
    length: 180,
    requestedBy: 'User1',
    isBumped: false,
    isShuffled: false,
    isShuffleEntered: false
  },
  {
    youtubeId: 'def456',
    title: 'Song Title 2',
    length: 240,
    requestedBy: 'User2',
    isBumped: true,
    isShuffled: false,
    isShuffleEntered: false
  },
  {
    youtubeId: 'ghi789',
    title: 'Song Title 3',
    length: 300,
    requestedBy: 'User3',
    isBumped: false,
    isShuffled: true,
    isShuffleEntered: true
  },
  {
    youtubeId: 'jkl012',
    title: 'Song Title 4',
    length: 210,
    requestedBy: 'User4',
    isBumped: false,
    isShuffled: false,
    isShuffleEntered: false
  }
];
