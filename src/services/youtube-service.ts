import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import {
  RegionRestriction,
  VideoListItem,
  VideoListResponse
} from '../types/youtube';
import { SSMClient } from '@aws-sdk/client-ssm';
import { Logger } from '@aws-lambda-powertools/logger';
import { getParameter } from '@aws-lambda-powertools/parameters/ssm';

export interface YouTubeVideoResult {
  id: string;
  title: string;
  duration: number; // in seconds
  isPublic: boolean;
  isLive: boolean;
  availableInUS: boolean;
  isEmbeddable: boolean;
}

export class YouTubeService {
  private static readonly ssmClient = new SSMClient({ region: 'us-east-1' });
  private static readonly logger = new Logger({
    serviceName: 'youtube-client'
  });

  private static apiKey: string = process.env.YOUTUBE_API_KEY || '';

  private static readonly YOUTUBE_API_URL =
    'https://www.googleapis.com/youtube/v3/videos';

  static async getVideo(youtubeId: string) {
    const youtubeApiKey = await getParameter('youtube-api-key', {
      decrypt: true,
      maxAge: 3600
    });

    const youtubeUrl = new URL(YouTubeService.YOUTUBE_API_URL);
    youtubeUrl.search = new URLSearchParams({
      key: youtubeApiKey!,
      part: 'contentDetails,snippet,status',
      id: youtubeId
    }).toString();

    YouTubeService.logger.info(`Calling ${youtubeUrl}`);

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

    if (data.items.length === 0) {
      throw new Error('Video not found');
    } else if (data.items.length > 1) {
      throw new Error('Multiple videos found');
    }

    const video = data.items[0];
    return YouTubeService.createYouTubeVideoResult(video);
  }

  private static createYouTubeVideoResult(
    video: VideoListItem
  ): YouTubeVideoResult {
    const { snippet, contentDetails, status } = video;

    return {
      id: video.id,
      title: video.snippet.title,
      duration: YouTubeService.convertDurationToSeconds(
        contentDetails.duration
      ),
      isLive: snippet.liveBroadcastContent === 'live',
      isPublic: status.privacyStatus === 'public',
      availableInUS: YouTubeService.checkUSAvailability(
        contentDetails.regionRestriction
      ),
      isEmbeddable: status.embeddable
    };
  }

  // Convert ISO 8601 duration (e.g., PT4M30S) to seconds
  private static convertDurationToSeconds(duration: string): number {
    const regex = /^PT(\d+H)?(\d+M)?(\d+S)?$/;
    const match = duration.match(regex);

    if (!match) {
      throw new Error('Invalid YouTube duration format');
    }

    const hours = parseInt(match[1]?.replace('H', '') || '0', 10);
    const minutes = parseInt(match[2]?.replace('M', '') || '0', 10);
    const seconds = parseInt(match[3]?.replace('S', '') || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Check if the video is available in the US (basic check, can be expanded)
  private static checkUSAvailability(
    regionRestriction: RegionRestriction
  ): boolean {
    // This can be adjusted based on the actual availability data from YouTube.
    // Assuming there's an API field for this or use a different service to check availability.
    // If there is no restriction, assume it's available.
    if (!regionRestriction || !regionRestriction.allowed) {
      return true;
    }

    return regionRestriction.allowed.includes('US');
  }
}
