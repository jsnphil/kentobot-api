/* eslint-disable @typescript-eslint/no-explicit-any */
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { RequestType } from '../types/song-request';
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

export async function processSongRequestRules(video: VideoListItem) {
  const failedRules = [];
  if (!isEmbeddable(video.status)) {
    failedRules.push('Video cannot be embedded');
  }

  if (!(await isPublicVideo(video.status))) {
    failedRules.push('Video is not public');
  }

  if (isLivestream(video.snippet)) {
    failedRules.push('Video is a live stream');
  }

  if (!(await validDuration(video.contentDetails.duration))) {
    const limit = await getValidDuration();

    const minutes = Math.floor(limit / 60);
    const remainingSeconds = limit % 60;
    const formattedSeconds = padTimeDigits(remainingSeconds);

    failedRules.push(
      `Video exceeds max duration (${minutes}:${formattedSeconds})`
    );
  }

  if (!validRegion(video.contentDetails.regionRestriction)) {
    failedRules.push('Video is not available in the US');
  }

  if (!(await isLicensed(video.contentDetails))) {
    failedRules.push('Video is not licensed');
  }

  return {
    status: failedRules.length == 0,
    failedRules: failedRules
  };
}

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
  return snippet.liveBroadcastContent == 'live';
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
