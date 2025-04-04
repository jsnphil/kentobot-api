export class RequestSongCommand {
  public readonly requestedBy: string;
  public readonly songId: string;

  constructor(requestedBy: string, songId: string) {
    this.requestedBy = requestedBy;
    this.songId = songId;
  }
}
