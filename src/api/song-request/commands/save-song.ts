import { SongRepository } from '../../../repositories/SongRepository';
import { Song } from '../../../types/song-request';

const songRepo = new SongRepository();

export class SaveSongCommand {
  async execute(song: Song): Promise<void> {
    console.log(`Saving song [${JSON.stringify(song, null, 2)}]`);

    try {
      await songRepo.save(song);
      console.log('Song saved successfully');
    } catch (err) {
      // console.error(err);
      console.log(`Failed to save song: ${err}`);
      throw new Error('Failed to save song');
    }
  }
}
