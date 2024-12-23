interface SongHistoryRequest {
  readonly youtubeId: string;
  readonly title: string;
  readonly plays: SongPlay[];
}

interface SongPlay {
  readonly playDate: string;
  readonly requester: string;
}
