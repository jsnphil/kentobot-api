export enum RequestType {
  Song_Request,
  DJ_Hour
}

export enum BumpType {
  Bean = 'bean',
  ChannelPoints = 'channelPoints',
  Bits = 'bits',
  Sub = 'sub',
  GiftedSub = 'giftedSub',
  Raid = 'raid',
  ShuffleWinner = 'shuffleWinner'
}

export interface SongRequest {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly requestedBy: string;
  readonly played?: string;
  readonly allowOverride?: boolean;
}

export interface SongInfo {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly playCount?: number;
}

export interface SongPlay {
  readonly date: Date;
  readonly requestedBy: string;
  readonly sotnContender: boolean;
  readonly sotnWinner: boolean;
  readonly sotsWinner: boolean;
}

export interface SongQueueItem {
  // readonly position: number;
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly requestedBy: string;
  isBumped: boolean;
  isShuffled: boolean;
  isShuffleEntered: boolean;
}

export enum YouTubeErrorCode {
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  MULTIPLE_RESULTS = 'MULTIPLE_RESULTS',
  VIDEO_NOT_EMBEDDABLE = 'VIDEO_NOT_EMBEDDABLE',
  VIDEO_NOT_PUBLIC = 'VIDEO_NOT_PUBLIC',
  LIVE_STREAM_VIDEO = 'LIVE_STREAM_VIDEO',
  VIDEO_UNAVAILABLE = 'VIDEO_UNAVAILABLE',
  VIDEO_UNLICENSED = 'VIDEO_UNLICENSED'
}

export enum SongRequestErrorCode {
  SONG_ALREADY_REQUESTED = 'SONG_ALREADY_REQUESTED',
  USER_MAX_REQUESTS = 'USER_MAX_REQUESTS',
  SONG_EXCEEDEDS_MAX_DURATION = 'SONG_EXCEEDEDS_MAX_DURATION',
  QUEUE_CLOSED = 'QUEUE_CLOSED'
}

export enum QueueManagementErrorCode {
  QUEUE_EMPTY = 'Queue is empty',
  BUMPS_NOT_AVAILABLE = 'BUMPS_NOT_AVAILABLE',
  USER_NOT_ELIGIBLE = 'USER_NOT_ELIGIBLE',
  REQUEST_NOT_FOUND = 'Request not found'
}

export interface MoveRequestData {
  position: number;
}

export interface BumpRequestData {
  user: string;
  modOverride?: boolean;
  position?: number;
}

export enum SongRequestStatus {
  QUEUED = 'QUEUED',
  BUMPED = 'BUMPED',
  SHUFFLE_ENTERED = 'SHUFFLE_ENTERED',
  SHUFFLE_WINNER = 'SHUFFLE_WINNER',
  PLAYED = 'PLAYED'
}
