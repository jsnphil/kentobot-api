export class SavePlayedSongCommand {
  public readonly songId: string;
  public readonly songTitle: string;
  public readonly requestedBy: string;
  public readonly duration: number;

  public constructor(
    songId: string,
    songTitle: string,
    requestedBy: string,
    duration: number
  ) {
    this.songId = songId;
    this.songTitle = songTitle;
    this.requestedBy = requestedBy;
    this.duration = duration;
  }
}
