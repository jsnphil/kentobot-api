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

  public moveSong(songId: string, newPosition: number) {
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

  public bumpUserRequest(user: string, bumpType: string, position?: number) {
    if (this.songs.length === 0) {
      throw new Error('Queue is empty');
    }

    const songIndex = this.songs.findIndex((song) => song.requestedBy === user);

    if (songIndex === -1) {
      throw new Error('Request not found in queue');
    }

    const bumpPosition = this.getBumpPosition(position);

    // 🔹 Remove song from current position
    const [song] = this.songs.splice(songIndex, 1);
    song.status = 'bumped';

    // 🔹 Insert song at new position
    this.songs.splice(bumpPosition, 0, song);

    return {
      songId: song.id,
      bumpPosition
    };
  }

  getBumpPosition(newPosition: number | undefined): number {
    if (newPosition) {
      return newPosition - 1;
    }

    for (let i = 0; i < this.songs.length; i++) {
      if (this.songs[i].status !== 'bumped') {
        return i;
      }
    }

    return 0;
  }

  public getSongByUser(requestedBy: string): Song | undefined {
    return this.songs.find((song) => song.requestedBy === requestedBy);
  }

  public getSongQueue(): Song[] {
    return this.songs;
  }
}
