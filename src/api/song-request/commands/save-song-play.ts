import { SongPlayRepository } from '../../../repositories/SongPlayRepository';
import { SongRepository } from '../../../repositories/SongRepository';
import { SongPlay } from '../../../types/song-request';

const songPlayRepo = new SongPlayRepository();

export class SaveSongPlayCommand {
  async execute(songId: string, songPlay: SongPlay): Promise<void> {
    console.log(`Saving song play - ${JSON.stringify(songPlay)}`);

    await songPlayRepo.save(songId, songPlay);
  }
}
