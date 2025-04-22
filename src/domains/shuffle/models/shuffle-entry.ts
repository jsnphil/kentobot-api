export class ShuffleEntry {
  private user: string;
  private songId: string;

  constructor(user: string, songId: string) {
    this.user = user;
    this.songId = songId;
  }

  getUser(): string {
    return this.user;
  }

  getSongId(): string {
    return this.songId;
  }
}
