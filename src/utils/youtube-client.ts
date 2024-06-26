import { RequestInfo, RequestInit } from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import { VideoListResponse } from '../types/youtube';
import { Logger } from '@aws-lambda-powertools/logger';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

const logger = new Logger();

const metrics = new Metrics({
  namespace: 'SongRequests',
  serviceName: 'YouTubeAPI'
});

console.log('Initializing SSM Client');
const ssmClient = new SSMClient({ region: 'us-east-1' });

let apiKey: string;

export const searchForVideo = async (songId: string) => {
  const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));

  const youtubeUrl = new URL(YOUTUBE_API_URL);
  youtubeUrl.search = new URLSearchParams({
    key: await getApiKey(),
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

export const getApiKey = async () => {
  if (apiKey) {
    return apiKey;
  }

  const response = await ssmClient.send(
    new GetParameterCommand({
      Name: 'youtube-api-key',
      WithDecryption: true
    })
  );

  apiKey = response.Parameter?.Value!;

  return apiKey;
};
