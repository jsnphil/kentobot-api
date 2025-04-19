import { Command } from '../commands/command';
import { EnterShuffleCommand } from '../commands/enter-shuffle-command';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { ShuffleRepository } from '../domains/stream/repositories/shuffle-repository';

export class ShuffleCommandHandler {
  constructor(
    private readonly shuffleRepo: ShuffleRepository // private readonly streamRepo: StreamRepository
  ) {}

  public async execute(command: Command): Promise<void> {
    if (!(command instanceof EnterShuffleCommand)) {
      this.handleEnterShuffleCommand(command);
    }
  }

  private async handleEnterShuffleCommand(command: Command): Promise<void> {
    if (!(command instanceof EnterShuffleCommand)) {
      throw new Error('Invalid command type');
    }

    const enterShuffleCommand = command as EnterShuffleCommand;
    const { user } = enterShuffleCommand;

    const shuffle = await this.shuffleRepo.getCurrentShuffle();
    if (!shuffle) {
      throw new Error('No active shuffle');
    }

    // Here you would typically interact with your song repository to enter shuffle
    // For this example, we'll just return the songId to simulate the shuffle
    const stream = await StreamFactory.createStream();

    const song = stream.getSongQueue().getSongRequestByUser(user);
    if (!song) {
      throw new Error(`No song found for user: ${user}`);
    }

    shuffle.join(user, song.id);
  }
}
