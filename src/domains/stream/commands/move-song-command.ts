export class MoveSongCommand {
  public readonly songId: string;
  public readonly position: number;

  constructor(songId: string, position: number) {
    this.songId = songId;
    this.position = position;
  }
}
