import { Logger } from '@aws-lambda-powertools/logger';
import { Command } from '../commands/command';
import { EnterShuffleCommand } from '../commands/enter-shuffle-command';
import { ToggleShuffleCommand } from '../commands/toggle-shuffle-command';
import { Shuffle } from '../domains/shuffle/models/shuffle';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { ShuffleRepository } from '../domains/stream/repositories/shuffle-repository';

export class ShuffleCommandHandler {
  private logger = new Logger({
    serviceName: 'shuffle-command-handler'
  });
  constructor() {}

  public async execute(command: Command): Promise<void> {
    if (command instanceof ToggleShuffleCommand) {
      await this.handleToggleShuffleCommand(command);
    } else if (command instanceof EnterShuffleCommand) {
      await this.handleEnterShuffleCommand(command);
    } else {
      throw new Error('Invalid command');
    }
  }

  private async handleToggleShuffleCommand(
    command: ToggleShuffleCommand
  ): Promise<void> {
    // TODO Throw an error if there is no stream
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

  private async handleEnterShuffleCommand(
    command: EnterShuffleCommand
  ): Promise<void> {
    // TODO Throw an error if there is no stream
    const stream = await StreamFactory.createStream();

    const enterShuffleCommand = command as EnterShuffleCommand;
    const { user } = enterShuffleCommand;

    this.logger.info(`User ${user} is entering the shuffle`);

    const shuffle = await ShuffleRepository.getShuffle(stream.getStreamDate());
    if (!shuffle) {
      throw new Error('No active shuffle');
    }

    const song = stream.getSongQueue().getSongRequestByUser(user);
    if (!song) {
      throw new Error(`No song found for user: ${user}`);
    }

    shuffle.join(user, song.id);
    await ShuffleRepository.save(shuffle);

    // TODO Trigger event to notify the stream about the new participant
  }
}
