import { SongQueueItem, SongRequest } from './types/song-request';

export class SongQueue {
  private songs: SongQueueItem[] = [];

  constructor() {
    this.songs = [];
  }

  addSong(song: SongRequest) {
    // TODO Add queue rules here?
    this.songs.push({
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
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.youtubeId === youtubeId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    this.songs.splice(index, 1);
  }

  removeSongForUser(requestedBy: string) {
    const index = this.songs.findIndex(
      (song) => song.requestedBy === requestedBy
    );

    if (index === -1) {
      throw new Error('User does not have a song in the queue');
    }

    this.removeSong(this.songs[index].youtubeId);
  }

  findSongById(youtubeId: string) {
    return this.songs.find((song) => song.youtubeId === youtubeId);
  }

  findSongByUser(requestedBy: string) {
    return this.songs.find((song) => song.requestedBy === requestedBy);
  }

  moveSong(youtubeId: string, position: number) {
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.youtubeId === youtubeId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    const song = this.songs[index];
    this.songs.splice(index, 1);
    this.songs.splice(position - 1, 0, song);
  }

  toArray() {
    return this.songs;
  }

  getLength() {
    return this.songs.length;
  }
}
