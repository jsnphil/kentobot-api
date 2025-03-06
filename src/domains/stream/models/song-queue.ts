export class SongQueue {
  private _songs: string[]; // List of Song IDs or references

  constructor() {
    this._songs = [];
  }

  get songs(): string[] {
    return this._songs;
  }

  // Methods to manage the song queue (add, remove, reorder)
  addSong(songId: string): void {
    this._songs.push(songId);
  }

  removeSong(songId: string): void {
    this._songs = this._songs.filter((id) => id !== songId);
  }

  reorderSongs(newOrder: string[]): void {
    this._songs = newOrder;
  }
}
