import { SongQueueItem, SongRequest } from './song-request';

export class SongQueue {
  private songs: SongQueueItem[] = [];

  constructor() {
    this.songs = [];
  }

  addSong(song: SongRequest) {
    // TODO Add queue rules here?
    this.songs.push({
      position: this.songs.length + 1,
      youtubeId: song.youtubeId,
      title: song.title,
      length: song.length,
      requestedBy: song.requestedBy,
      isBumped: false,
      isShuffled: false,
      isShuffleEntered: false
    });
  }

  removeSong(youtubeId: string) {
    const index = this.songs.findIndex((song) => song.youtubeId === youtubeId);
    if (index !== -1) {
      throw new Error('Request not found in queue');
    }

    this.songs = this.songs.splice(index, 1);
  }

  removeUserSongs(requestedBy: string) {
    const index = this.songs.findIndex(
      (song) => song.requestedBy === requestedBy
    );
    if (index !== -1) {
      throw new Error('Request not found in the queue');
    }

    this.songs = this.songs.splice(index, 1);
  }

  toArray() {
    return this.songs;
  }

  getLength() {
    return this.songs.length;
  }
}
