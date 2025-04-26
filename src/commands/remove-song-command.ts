export class RemoveSongCommand {
  public readonly songId: string;

  constructor(songId: string) {
    this.songId = songId;
  }
}
