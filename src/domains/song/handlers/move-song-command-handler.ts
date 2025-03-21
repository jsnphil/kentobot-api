import { generateStreamDate } from '@utils/utilities';
import { MoveSongCommand } from '../../stream/commands/move-song-command';
import { Stream } from '../../stream/models/stream';
import { StreamRepository } from '../../stream/repositories/stream-repository';

export class MoveSongCommandHandler {
  public async execute(command: MoveSongCommand): Promise<{ songId: string }> {
    // Here you would typically interact with your song repository to remove the song
    // For this example, we'll just return the songId to simulate the removal

    const streamDate = generateStreamDate();
    const streamData = await StreamRepository.loadStream(streamDate);

    if (!streamData) {
      throw new Error('Stream not found');
    }

    const stream = Stream.load(streamData);

    await stream.moveSong(command.songId, command.position);
    await StreamRepository.saveStream(stream);

    return { songId: command.songId };
  }
}
