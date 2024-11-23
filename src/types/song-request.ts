export enum RequestType {
  Song_Request,
  DJ_Hour
}

export interface Song {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly plays?: SongPlay[];
}

export interface SongPlay {
  readonly date: Date;
  readonly requester: string;
  readonly sotnContender: boolean;
  readonly sotnWinner: boolean;
  readonly sotsWinner: boolean;
}

export interface SongPlayedEvent {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
  readonly requestedBy: string;
  readonly played: string;
}
