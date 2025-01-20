import { VideoListItem } from './youtube';

export enum RequestType {
  Song_Request,
  DJ_Hour
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
  readonly isBumped: boolean;
  readonly isShuffled: boolean;
  readonly isShuffleEntered: boolean;
}

export interface RequestSongBody {
  readonly youtubeId: string;
  readonly requestedBy: string;
  readonly modOverride?: boolean;
}

export interface SongRequestResult {
  readonly songInfo?: SongInfo;
  readonly failedRule?: string;
  readonly error?: Error;
}

export interface YouTubeSearchResult {
  readonly video?: VideoListItem;
  readonly failedRule?: string;
  readonly error?: Error;
}

export interface AddSongToQueueResult {
  readonly songAdded: boolean;
  readonly failedRule?: string;
  readonly error?: Error;
}

export interface ValidationResult<T> {
  success: boolean; // Indicates whether the operation was successful
  data?: T; // The resulting object, if applicable
  errors?: ValidationError[]; // List of validation or rule errors
}

export interface ValidationError {
  code: string; // A machine-readable error code
  message: string; // A user-friendly error message
  context?: any; // Optional additional context about the error
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
  SONG_EXCEEDEDS_MAX_DURATION = 'SONG_EXCEEDEDS_MAX_DURATION'
}

export interface MoveRequestData {
  position: number;
  isBump: boolean;
}
