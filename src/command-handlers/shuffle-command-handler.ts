import { Command } from '../commands/command';
import { ToggleShuffleCommand } from '../commands/toggle-shuffle-command';
import { Shuffle } from '../domains/shuffle/models/shuffle';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { ShuffleRepository } from '../domains/stream/repositories/shuffle-repository';

export class ShuffleCommandHandler {
  constructor() {}

  public async execute(command: Command): Promise<void> {
    if (command instanceof ToggleShuffleCommand) {
      await this.handleToggleShuffleCommand(command);
    }
  }

  private async handleToggleShuffleCommand(
    command: ToggleShuffleCommand
  ): Promise<void> {
    const stream = await StreamFactory.createStream();
    let shuffle = await ShuffleRepository.getShuffle(stream.getStreamDate());

    if (!shuffle) {
      shuffle = Shuffle.create(stream.getStreamDate(), new Date());
    }

    if (command.status === 'open') {
      shuffle.start();
    } else {
      shuffle.close();
    }

    await ShuffleRepository.save(shuffle);
  }

  // private async handleEnterShuffleCommand(command: EnterShuffleCommand): Promise<void> {
  //   if (!(command instanceof EnterShuffleCommand)) {
  //     throw new Error('Invalid command type');
  //   }

  //   const enterShuffleCommand = command as EnterShuffleCommand;
  //   const { user } = enterShuffleCommand;

  //   const shuffle = await this.shuffleRepo.getCurrentShuffle();
  //   if (!shuffle) {
  //     throw new Error('No active shuffle');
  //   }

  //   // Here you would typically interact with your song repository to enter shuffle
  //   // For this example, we'll just return the songId to simulate the shuffle
  //   const stream = await StreamFactory.createStream();

  //   const song = stream.getSongQueue().getSongRequestByUser(user);
  //   if (!song) {
  //     throw new Error(`No song found for user: ${user}`);
  //   }

  //   shuffle.join(user, song.id);
  // }
}
