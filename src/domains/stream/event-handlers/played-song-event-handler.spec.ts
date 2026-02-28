import { SongRepository } from '@repositories/song-repository';
import { SongRequest } from '../../../types/song-request';

import { Logger } from '@aws-lambda-powertools/logger';
import { saveSongData } from './played-song-event-handler';

vi.mock('@repositories/song-repository');
vi.mock('@aws-lambda-powertools/logger');

describe('saveSongData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save new song play if song exists', async () => {
    const playedSong: SongRequest = {
      youtubeId: '123',
      title: 'Test Song',
      length: 300,
      played: new Date().toISOString(),
      requestedBy: 'User1'
    };

    vi.spyOn(SongRepository.prototype, 'songExists').mockResolvedValue(true);

    const loggerSpy = vi.spyOn(Logger.prototype, 'info');

    await saveSongData(playedSong);

    expect(loggerSpy).toHaveBeenLastCalledWith('Song exists, saving play data');
  });

  it('should save new song song does not exist', async () => {
    const playedSong: SongRequest = {
      youtubeId: '123',
      title: 'Test Song',
      length: 300,
      played: new Date().toISOString(),
      requestedBy: 'User1'
    };

    vi.spyOn(SongRepository.prototype, 'songExists').mockResolvedValue(false);

    const loggerSpy = vi.spyOn(Logger.prototype, 'info');

    await saveSongData(playedSong);

    expect(loggerSpy).toHaveBeenLastCalledWith(
      'Song does not exist, saving song and play'
    );
  });
});
