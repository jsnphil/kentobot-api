import { SongQueue } from '../song-queue';
import { WebSocketService } from './web-socket-service';

const webSocketService = new WebSocketService();

export class SongRequestService {
  constructor() {}

  // TODO Come back and implement these
  // addSong(song: Song) {
  //   this.songQueue.addSong(song);
  // }

  // removeSong(youtubeId: string) {
  //   this.songQueue.removeSong(youtubeId);
  // }

  // removeSongForUser(requestedBy: string) {
  //   this.songQueue.removeSongForUser(requestedBy);
  // }

  // findSongById(youtubeId: string) {
  //   return this.songQueue.findSongById(youtubeId);
  // }

  // findSongByUser(requestedBy: string) {
  //   return this.songQueue.findSongByUser(requestedBy);
  // }

  // moveSong(youtubeId: string, position: number) {
  //   this.songQueue.moveSong(youtubeId, position);
  // }

  sendNextSong = async (connectionId: string) => {
    const songQueue = await SongQueue.loadQueue();
    const nextSong = songQueue.getNextSong();

    if (nextSong) {
      songQueue.save();

      // Send the next song to the song player connection
      await webSocketService.broadcast(
        JSON.stringify({
          songData: {
            currentSong: {
              youtubeId: nextSong.youtubeId,
              title: nextSong.title,
              requestedBy: nextSong.requestedBy,
              length: nextSong.length
            },
            songQueue: songQueue.toArray()
          },
          requests: {
            youtubeId: nextSong.youtubeId,
            title: nextSong.title,
            requestedBy: nextSong.requestedBy
          }
        })
      );
    }
  };
}
