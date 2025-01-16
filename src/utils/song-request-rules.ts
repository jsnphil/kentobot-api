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

console.log('Initializing SSM Client');
const client = new SSMClient({ region: 'us-east-1' });

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
    console.log('Public video enforcement toggle is enabled');
    return status.privacyStatus === 'public';
  } else {
    console.log('Public video enforcement toggle is disabled, ignoring check');
    return true;
  }
}

export function isLivestream(snippet: Snippet) {
  return snippet.liveBroadcastContent !== 'live';
}

/* c8 ignore start */ // Ignoring this function as it is a wrapper around an AWS SDK call
async function getValidDuration(type?: RequestType) {
  let parameterName;
  if (type == RequestType.DJ_Hour) {
    parameterName = process.env.DJ_HOUR_REQUEST_DURATION_NAME;
  } else {
    parameterName = process.env.REQUEST_DURATION_NAME;
  }

  const response = await client.send(
    new GetParameterCommand({
      Name: parameterName
    })
  );
  console.log(response);
  return Number(response.Parameter?.Value);
}
/* c8 ignore end */

export async function validDuration(duration: string, type?: RequestType) {
  // Ex. Duration - PT30M13S (30 minutes, 13 seconds)

  const limit = await getValidDuration(type);
  const durationAsSeconds = toSeconds(parse(duration));

  console.log(durationAsSeconds);

  console.log(
    `Song limit: ${limit}, Song duration ${duration}, Song duration (as seconds) ${durationAsSeconds}`
  );

  return durationAsSeconds <= limit;
}

export function validRegion(regionRestriction: RegionRestriction) {
  if (!regionRestriction) {
    return true;
  }

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
