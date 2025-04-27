import { Song } from './song';
import { YouTubeService } from '@services/youtube-service';
import { SongValidator } from '../validators/song-validator';
import { SongRequestStatus } from '../../../types/song-request';

jest.mock('@services/youtube-service');
jest.mock('../validators/song-validator');

describe('Song', () => {
  const mockYouTubeVideo = {
    id: '123',
    title: 'Test Song',
    duration: 300
  };

  beforeEach(() => {
    (YouTubeService.getVideo as jest.Mock).mockResolvedValue(mockYouTubeVideo);
    (SongValidator.validate as jest.Mock).mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Song instance with valid data', async () => {
    const song = await Song.create('123', 'Kaladlin');

    expect(song.id).toBe(mockYouTubeVideo.id);
    expect(song.title).toBe(mockYouTubeVideo.title);
    expect(song.requestedBy).toBe('Kaladlin');
    expect(song.status).toBe(SongRequestStatus.QUEUED);
    expect(song.duration).toBe(mockYouTubeVideo.duration);
  });

  it('should throw an error if YouTubeService.getVideo fails', async () => {
    (YouTubeService.getVideo as jest.Mock).mockRejectedValue(
      new Error('Video not found')
    );

    await expect(Song.create('invalid-id', 'vin')).rejects.toThrow(
      'Video not found'
    );
  });

  it('should throw an error if SongValidator.validate fails', async () => {
    (SongValidator.validate as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid video data');
    });

    await expect(Song.create('123', 'Dalinar')).rejects.toThrow(
      'Invalid video data'
    );
  });
});
