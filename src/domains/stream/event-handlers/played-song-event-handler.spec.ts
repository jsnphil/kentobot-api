import { SongRepository } from '@repositories/song-repository';
import { SongRequest } from '../../../types/song-request';

import { Logger } from '@aws-lambda-powertools/logger';
import { saveSongData } from './played-song-event-handler';

jest.mock('@repositories/song-repository');
jest.mock('@aws-lambda-powertools/logger');

describe('saveSongData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save new song play if song exists', async () => {
    const playedSong: SongRequest = {
      youtubeId: '123',
      title: 'Test Song',
      length: 300,
      played: new Date().toISOString(),
      requestedBy: 'User1'
    };

    jest.spyOn(SongRepository.prototype, 'songExists').mockResolvedValue(true);

    const loggerSpy = jest.spyOn(Logger.prototype, 'info');

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

    jest.spyOn(SongRepository.prototype, 'songExists').mockResolvedValue(false);

    const loggerSpy = jest.spyOn(Logger.prototype, 'info');

    await saveSongData(playedSong);

    expect(loggerSpy).toHaveBeenLastCalledWith(
      'Song does not exist, saving song and play'
    );
  });
});
