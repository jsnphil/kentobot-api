export class RequestSongCommand {
  public readonly userId: string;
  public readonly songId: string;

  constructor(userId: string, songId: string) {
    this.userId = userId;
    this.songId = songId;
  }
}
