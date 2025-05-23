import { generateStreamDate } from '@utils/utilities';
import { StreamRepository } from '@repositories/stream-repository';
import { Stream } from '@domains/stream/models/stream';
import { MoveSongCommand } from '@commands/move-song-command';

export class MoveSongCommandHandler {
  public async execute(command: MoveSongCommand) {
    // Here you would typically interact with your song repository to remove the song
    // For this example, we'll just return the songId to simulate the removal

    const streamDate = generateStreamDate();
    const streamData = await StreamRepository.loadStream(streamDate);

    if (!streamData) {
      throw new Error('Stream not found');
    }

    const stream = Stream.load(streamData);

    stream.moveSong(command.songId, command.position);
    await StreamRepository.saveStream(stream);
  }
}
