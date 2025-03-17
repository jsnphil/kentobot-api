import { EventPublisher } from '../../../common/event-publisher';
import { SongAddedToQueueEvent } from '../events/song-added-to-queue-event';
import { SongRemovedFromQueue } from '../events/song-removed-from-queue-event';
import { Song } from './song';

export class SongQueue {
  private songs: Song[] = [];

  constructor(songs: Song[] = []) {
    this.songs = songs;
  }

  // TODO Create custom exception types for these
  public async addSong(song: Song): Promise<void> {
    if (this.songs.some((s) => s.id === song.id)) {
      throw new Error('Song already exists in the queue');
    }

    if (this.songs.some((s) => s.requestedBy === song.requestedBy)) {
      throw new Error('User already has a song in the queue');
    }

    this.songs.push(song);

    // TODO Move to stream
    await EventPublisher.publishEvent(
      new SongAddedToQueueEvent(song),
      'song-added-to-queue' // TODO Make this an enum
    );
  }

  public async removeSong(songId: string): Promise<void> {
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.id === songId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    this.songs.splice(index, 1);
  }

  public async moveSong(songId: string, newPosition: number): Promise<void> {
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const index = this.songs.findIndex((song) => song.id === songId);
    if (index === -1) {
      throw new Error('Request not found in queue');
    }

    const song = this.songs.splice(index, 1)[0];
    this.songs.splice(newPosition, 0, song);
  }

  public getSongQueue(): Song[] {
    return this.songs;
  }
}
