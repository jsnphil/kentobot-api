import { SongRepository } from '../../../repositories/SongRepository';
import { Song } from '../../../types/song-request';

const songRepo = new SongRepository();

export class SaveSongCommand {
  async execute(song: Song): Promise<void> {
    console.log(`Saving song - ${JSON.stringify(song)}`);
    console.log(`Saving song request [${JSON.stringify(song, null, 2)}]`);

    // TODO Surround with a try/catch

    // Save the song
    await songRepo.save(song);

    // Save the play
    // const songDetails = JSON.parse(body) as PlayedSong;
    // await saveRequestCommand.execute(songDetails);

    // const saveSongPlayCommand = new SaveSongPlayCommand();
  }
}
