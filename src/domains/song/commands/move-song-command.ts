export class MoveSongCommand {
  public readonly songId: string;
  public readonly position: number;

  constructor(songId: string) {
    this.songId = songId;
    this.position = 0; // Default position
  }
}
