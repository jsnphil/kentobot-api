import { SongRequestStatus } from '../../../types/song-request';
import { SavePlayedSongCommand } from '../commands/save-played-song-command';
import { StreamFactory } from '../factories/stream-factory';
import { Song } from '../models/song';
import { StreamRepository } from '../repositories/stream-repository';

export class SavePlayedSongCommandHandler {
  public async execute(command: SavePlayedSongCommand): Promise<void> {
    // Here you would typically interact with your song repository to save the played song
    // For this example, we'll just return the songId to simulate the save
    const stream = await StreamFactory.createStream();

    const song = Song.load(
      command.songId,
      command.requestedBy,
      command.songTitle,
      SongRequestStatus.PLAYED,
      command.duration
    );

    stream.savePlayedSong(song);

    await StreamRepository.saveStream(stream);
  }
}
//
