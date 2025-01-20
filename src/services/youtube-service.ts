import { Logger } from '@aws-lambda-powertools/logger';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { VideoListItem, VideoListResponse } from '../types/youtube';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { ValidationResult, YouTubeErrorCode } from '../types/song-request';
import { checkYouTubeRules } from '../utils/song-request-rules';

export class YouTubeService {
  private static readonly ssmClient = new SSMClient({ region: 'us-east-1' });
  private readonly logger = new Logger({ serviceName: 'youtube-client' });
  private readonly apiKey: string;

  private readonly YOUTUBE_API_URL =
    'https://www.googleapis.com/youtube/v3/videos';

  constructor(apiKey: string) {
    this.logger.info('Initializing YouTubeClient');
    this.apiKey = apiKey;
  }

  static async initialize() {
    const response = await this.ssmClient.send(
      new GetParameterCommand({
        Name: 'youtube-api-key',
        WithDecryption: true
      })
    );

    /* istanbul ignore next */
    const apiKey = response.Parameter?.Value!;
    console.log(`API Key: ${apiKey}`);

    return new YouTubeService(apiKey);
  }

  /* istanbul ignore next */
  async getVideo(youtubeId: string) {
    const youtubeResult = await this.searchForVideo(youtubeId);

    return this.validateResult(youtubeResult);
  }

  async searchForVideo(youtubeId: string) {
    const youtubeUrl = new URL(this.YOUTUBE_API_URL);
    youtubeUrl.search = new URLSearchParams({
      key: this.apiKey,
      part: 'contentDetails,snippet,status',
      id: youtubeId
    }).toString();

    this.logger.info(`Calling ${youtubeUrl}`);

    const start = Date.now();

    const response = await fetch(youtubeUrl.toString(), {
      method: 'GET'
    });

    const end = Date.now();

    const data = (await response.json()) as VideoListResponse;
    this.logger.info(`Response: ${JSON.stringify(data, null, 2)}`);

    const metrics = new Metrics({
      namespace: 'SongRequests',
      serviceName: 'YouTubeAPI'
    });

    metrics.logMetrics();
    metrics.addMetric('youtubeApiCalls', MetricUnit.Count, 1);
    metrics.addMetric(
      'youtubeApiDurations',
      MetricUnit.Milliseconds,
      end - start
    );

    return data?.items ?? [];
  }

  async validateResult(videos: VideoListItem[]) {
    let result: ValidationResult<VideoListItem>;

    if (videos.length === 0) {
      result = {
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.VIDEO_NOT_FOUND,
            message: 'Video not found'
          }
        ]
      };
    } else if (videos.length > 1) {
      result = {
        success: false,
        errors: [
          {
            code: YouTubeErrorCode.MULTIPLE_RESULTS,
            message: 'Too many results'
          }
        ]
      };
    } else {
      result = await checkYouTubeRules(videos[0]);
    }

    return result;
  }
}
