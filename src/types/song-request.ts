export enum RequestType {
  Song_Request,
  DJ_Hour
}

export interface SongRequest {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly requestedBy: string;
  readonly played: string;
}

export interface SongInfo {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
}

export interface SongPlay {
  readonly date: Date;
  readonly requestedBy: string;
  readonly sotnContender: boolean;
  readonly sotnWinner: boolean;
  readonly sotsWinner: boolean;
}
