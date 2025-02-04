import { SongQueue } from '../song-queue';

export class SongQueueService {

  await addRequest(song: SongRequest): Promise<ValidationResult<SongQueueItem>> {
    const songQueue= await SongQueue.loadQueue();

    const addQueueResult = await songQueue.addSong({
      youtubeId: song.youtubeId,
      title: song.title,
      length: song.length,
      allowOverride: song.allowOverride,
      requestedBy: song.requestedBy
    });

  }
}
