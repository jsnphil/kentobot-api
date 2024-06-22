import {
  mockMultipleResults,
  mockSingleResult
} from '../../../mocks/mock-youtube-results';
import * as songRequestRules from '../../../utils/song-request-rules';
import * as youtubeClient from '../../../utils/youtube-client';
import { GetRequestQuery } from './get-request';

beforeEach(() => {
  jest.resetAllMocks;
});

describe('get-request', () => {
  it('should return a song valid song request', async () => {
    const videos = [mockSingleResult];

    const mockSongRequestRules = jest.spyOn(
      songRequestRules,
      'processSongRequestRules'
    );

    mockSongRequestRules.mockResolvedValue({
      status: true,
      failedRules: []
    });

    const mockYoutubeClient = jest.spyOn(youtubeClient, 'searchForVideo');
    mockYoutubeClient.mockResolvedValue(videos);

    const getRequestQuery = new GetRequestQuery();
    const result = await getRequestQuery.execute('123456');

    expect(result).toEqual({
      title: 'Test Song',
      youtubeId: '12345',
      length: 61
    });
  });

  it('should return undefined when a the YouTube results are undefined', async () => {
    const mockYoutubeClient = jest.spyOn(youtubeClient, 'searchForVideo');
    mockYoutubeClient.mockResolvedValue([]);

    const getRequestQuery = new GetRequestQuery();
    const result = await getRequestQuery.execute('123456');

    expect(result).toBeUndefined();
  });

  it('should return an error when there is more than one result', async () => {
    const mockYoutubeClient = jest.spyOn(youtubeClient, 'searchForVideo');
    mockYoutubeClient.mockResolvedValue(mockMultipleResults);

    const getRequestQuery = new GetRequestQuery();
    const result = await getRequestQuery.execute('123456');

    expect(result).toEqual({
      failedRules: ['Too many results']
    });
  });
});
