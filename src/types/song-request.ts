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
