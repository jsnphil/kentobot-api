import { SongQueueRepository } from './repositories/song-queue-repository';
import { SongQueueItem, SongRequest } from './types/song-request';
import { generateStreamDate } from './utils/utilities';

export class SongQueue {
  private songs: SongQueueItem[] = [];
  private songRepository = new SongQueueRepository();
  private streamDate: string;

  private constructor() {}

  static async loadQueue() {
    console.log('Creating new queue');
    const queue = new SongQueue();

    queue.streamDate = generateStreamDate();
    console.log(`Trying to load queue for stream date: ${queue.streamDate}`);
    await queue.load();

    console.log(`Queue loaded with ${queue.getLength()} songs`);
    console.log(`Queue: ${JSON.stringify(queue.toArray(), null, 2)}`);

    return queue;
  }

  async load() {
    this.songs = await this.songRepository.getQueue(this.streamDate);
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
