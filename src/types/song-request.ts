export enum RequestType {
  Song_Request,
  DJ_Hour
}

export interface Song {
  readonly youtubeId: string;
  readonly title: string;
  readonly length: number;
}
