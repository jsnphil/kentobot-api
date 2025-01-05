import { SongQueueRepository } from './repositories/song-queue-repository';
import { SongQueueItem, SongRequest } from './types/song-request';

export class SongQueue {
  private songs: SongQueueItem[] = [];
  private songRepository: SongQueueRepository;
  private streamDate: Date;

  private constructor() {
    this.songs = [];
    this.songRepository = new SongQueueRepository();
    this.streamDate = new Date();
  }

  static async load() {
    const queue = new SongQueue();
    const songQueue = await queue.songRepository.loadQueue(queue.streamDate);

    if (songQueue) {
      queue.songs = songQueue.songlist;
    }

    return queue;
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

  async clear() {
    this.songs = [];
    await this.songRepository.deleteQueue(this);
  }

  async save() {
    await this.songRepository.saveQueue(this);
  }

  getStreamDate() {
    return this.streamDate;
  }
}
