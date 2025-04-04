import { BumpSongCommand } from '../commands/bump-song-command';
import { StreamFactory } from '../factories/stream-factory';
import { StreamRepository } from '../repositories/stream-repository';

export class BumpSongCommandHandler {
  public async execute(command: BumpSongCommand): Promise<void> {
    // Here you would typically interact with your song repository to bump the song
    // For this example, we'll just return the songId to simulate the bump

    const stream = await StreamFactory.createStream();

    await stream.bumpSongForUser(
      command.requestdBy,
      command.bumpType,
      command.position,
      command.modOverride
    );

    await StreamRepository.saveStream(stream);

    // return { songId: command.songId };
  }
}
