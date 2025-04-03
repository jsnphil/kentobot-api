import { EnterShuffleCommand } from '../commands/enter-shuffle-command';
import { StreamFactory } from '../factories/stream-factory';
import { StreamRepository } from '../repositories/stream-repository';

export class EnterShuffleCommandHandler {
  public async execute(command: EnterShuffleCommand): Promise<void> {
    // Here you would typically interact with your song repository to enter shuffle mode
    // For this example, we'll just return the user to simulate the entry into shuffle mode

    // TOOD Change to loadStream()
    const stream = await StreamFactory.createStream();

    await stream.enterShuffle(command.user);

    await StreamRepository.saveStream(stream);
  }
}
