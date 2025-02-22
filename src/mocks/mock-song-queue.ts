import { SongQueueItem } from '../types/song-request';

export const mockSongQueue: SongQueueItem[] = [
  {
    youtubeId: 'mno345',
    title: 'Song Title 5',
    length: 200,
    requestedBy: 'Kaladin',
    isBumped: false,
    isShuffled: true,
    isShuffleEntered: true
  },
  {
    youtubeId: 'pqr678',
    title: 'Song Title 6',
    length: 220,
    requestedBy: 'Shallan',
    isBumped: true,
    isShuffled: false,
    isShuffleEntered: false
  },
  {
    youtubeId: 'stu901',
    title: 'Song Title 7',
    length: 250,
    requestedBy: 'Dalinar',
    isBumped: false,
    isShuffled: false,
    isShuffleEntered: false
  },
  {
    youtubeId: 'vwx234',
    title: 'Song Title 8',
    length: 270,
    requestedBy: 'Adolin',
    isBumped: true,
    isShuffled: true,
    isShuffleEntered: true
  },
  {
    youtubeId: 'yz1234',
    title: 'Song Title 9',
    length: 230,
    requestedBy: 'Jasnah',
    isBumped: false,
    isShuffled: false,
    isShuffleEntered: false
  }
];
