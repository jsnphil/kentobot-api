import { RequestInfo, RequestInit } from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import { VideoListResponse } from '../types/youtube';
import { Logger } from '@aws-lambda-powertools/logger';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';
const apiKey = 'AIzaSyCEZ0uiztXU58aC4ltMkNw7oG_D8QmXulY'; // TODO Get from secrets manager or parameter store

const logger = new Logger();

const metrics = new Metrics({
  namespace: 'SongRequests',
  serviceName: 'YouTubeAPI'
});

export const searchForVideo = async (songId: string) => {
  const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));

  const youtubeUrl = new URL(YOUTUBE_API_URL);
  youtubeUrl.search = new URLSearchParams({
    key: apiKey,
    part: 'contentDetails,snippet,status',
    id: songId
  }).toString();

  logger.info(`Calling ${youtubeUrl}`);

  const start = Date.now();

  const response = await fetch(youtubeUrl.toString(), {
    method: 'GET'
  });

  const end = Date.now();

  const data = (await response.json()) as VideoListResponse;
  logger.info(`Response: ${JSON.stringify(data, null, 2)}`);
  metrics.logMetrics();
  metrics.addMetric('youtubeApiCalls', MetricUnit.Count, 1);
  metrics.addMetric(
    'youtubeApiDurations',
    MetricUnit.Milliseconds,
    end - start
  );

  return data?.items ?? [];
};
