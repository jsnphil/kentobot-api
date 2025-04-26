import { VideoListItem } from '../types/youtube';

export const mockSingleResult = {
  snippet: {
    title: 'Test Song'
  },
  id: '12345',
  contentDetails: {
    duration: 'PT1M1S'
  }
} as unknown as VideoListItem;

export const mockMultipleResults = [
  {
    snippet: {
      title: 'Test Song 1'
    },
    id: '12345',
    contentDetails: {
      duration: 'PT1M1S'
    }
  },
  {
    snippet: {
      title: 'Test Song 2'
    },
    id: '67890',
    contentDetails: {
      duration: 'PT2M'
    }
  }
] as VideoListItem[];
