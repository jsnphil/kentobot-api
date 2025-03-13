import { EventPublisher } from '../../../common/event-publisher';
import { SongAddedToQueueEvent } from '../../stream/events/song-added-to-queue-event';
import { Song } from './song';

export class SongQueue {
  private songs: Song[] = [];

  constructor(songs: Song[] = []) {
    this.songs = songs;
  }

  public async addSong(song: Song): Promise<void> {
    if (this.songs.some((s) => s.id === song.id)) {
      throw new Error('Song already exists in the queue');
    }

    if (this.songs.some((s) => s.requestedBy === song.requestedBy)) {
      throw new Error('User already has a song in the queue');
    }

    this.songs.push(song);

    await EventPublisher.publishEvent(
      new SongAddedToQueueEvent(song),
      'SongAddedToQueueEvent' // TODO Make this an enum
    );
  }

  public getSongQueue(): Song[] {
    return this.songs;
  }
}
