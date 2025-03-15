import { generateStreamDate } from '@utils/utilities';
import { StreamRepository } from '../../../infrastructure/stream-repository';
import { Stream } from '../../stream/models/stream';

export class RemoveSongCommandHandler {
  public async execute(command: {
    songId: string;
  }): Promise<{ songId: string }> {
    // Here you would typically interact with your song repository to remove the song
    // For this example, we'll just return the songId to simulate the removal

    const streamDate = generateStreamDate();
    const streamData = await StreamRepository.loadStream(streamDate);

    if (!streamData) {
      throw new Error('Stream not found');
    }

    const stream = Stream.load(streamData);

    await stream.removeSongFromQueue(command.songId);
    await StreamRepository.saveStream(stream);

    return { songId: command.songId };
  }
}
