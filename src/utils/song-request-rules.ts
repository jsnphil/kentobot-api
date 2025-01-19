/* eslint-disable @typescript-eslint/no-explicit-any */
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import {
  RequestType,
  ValidationResult,
  YouTubeErrorCode
} from '../types/song-request';
import {
  ContentDetails,
  RegionRestriction,
  Snippet,
  Status,
  VideoListItem
} from '../types/youtube';
import { padTimeDigits } from './utilities';
import { parse, toSeconds } from 'iso8601-duration';
import { Logger } from '@aws-lambda-powertools/logger';

const client = new SSMClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-request-rules' });

export const checkYouTubeRules = async (
  video: VideoListItem
): Promise<ValidationResult<VideoListItem>> => {
  const rules = [
    {
      code: YouTubeErrorCode.VIDEO_NOT_EMBEDDABLE,
      name: 'Video is not embeddable',
      fn: (video: VideoListItem) => isEmbeddable(video.status)
    },
    {
      code: YouTubeErrorCode.VIDEO_NOT_PUBLIC,
      name: 'Video is not public',
      fn: async (video: VideoListItem) => await isPublicVideo(video.status)
    },
    {
      code: YouTubeErrorCode.LIVE_STREAM_VIDEO,
      name: 'Video is a live stream',
      fn: (video: VideoListItem) => isLivestream(video.snippet)
    },
    {
      code: YouTubeErrorCode.VIDEO_UNAVAILABLE,
      name: 'Video is not available in the US',
      fn: (video: VideoListItem) =>
        validRegion(video.contentDetails.regionRestriction)
    },
    {
      code: YouTubeErrorCode.VIDEO_UNLICENSED,
      name: 'Video is not licensed',
      fn: async (video: VideoListItem) => await isLicensed(video.contentDetails)
    }
  ];

  for (const rule of rules) {
    const result = await rule.fn(video);
    if (!result) {
      return {
        success: false,
        errors: [
          {
            code: rule.code,
            message: rule.name
          }
        ]
      };
    }
  }

  return {
    success: true,
    data: video
  };
};

export function isEmbeddable(status: Status) {
  return status.embeddable;
}

export async function isPublicVideo(status: Status) {
  const response = await client.send(
    new GetParameterCommand({
      Name: process.env.PUBLIC_VIDEO_TOGGLE_NAME
    })
  );
  const toggleSetting = response.Parameter?.Value;

  if (toggleSetting === 'true') {
    logger.debug('Public video enforcement toggle is enabled');
    return status.privacyStatus === 'public';
  } else {
    logger.debug('Public video enforcement toggle is disabled, ignoring check');
    return true;
  }
}

export function isLivestream(snippet: Snippet) {
  return snippet.liveBroadcastContent !== 'live';
}

/* istanbul ignore next */
async function getValidDuration(type?: RequestType) {
  const parameterName = process.env.REQUEST_DURATION_NAME;

  const response = await client.send(
    new GetParameterCommand({
      Name: parameterName
    })
  );
  return Number(response.Parameter?.Value);
}

export async function validDuration(duration: string, type?: RequestType) {
  // Ex. Duration - PT30M13S (30 minutes, 13 seconds)

  const limit = await getValidDuration(type);
  const durationAsSeconds = toSeconds(parse(duration));

  logger.debug(
    `Song limit: ${limit}, Song duration ${duration}, Song duration (as seconds) ${durationAsSeconds}`
  );

  return durationAsSeconds <= limit;
}

export function validRegion(regionRestriction: RegionRestriction) {
  if (regionRestriction.allowed.includes('US')) {
    return true;
  }

  return false;
}

export async function isLicensed(contentDetails: ContentDetails) {
  const response = await client.send(
    new GetParameterCommand({
      Name: process.env.LICENSED_VIDEO_TOGGLE_NAME
    })
  );

  const toggleSetting = response.Parameter?.Value;

  if (toggleSetting === 'true') {
    return contentDetails.licensedContent;
  } else {
    return true;
  }
}
