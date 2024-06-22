export interface VideoListResponse {
  kind: string;
  etag: string;
  items: VideoListItem[];
  pageInfo: PageInfo;
}

export interface VideoListItem {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
  status: Status;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: Localized;
  defaultAudioLanguage: string;
}

export interface Localized {
  title: string;
  description: string;
}

export interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
}
export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface ContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  regionRestriction: RegionRestriction;
  contentRating: ContentRating;
  projection: string;
}

export interface RegionRestriction {
  allowed: string[];
}

export interface ContentRating {
  mpaaRating: string;
}

export interface Status {
  uploadStatus: string;
  failureReason: string;
  rejectionReason: string;
  privacyStatus: string;
  license: string;
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
