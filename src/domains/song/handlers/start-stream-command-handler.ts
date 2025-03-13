import { StartStreamCommand } from '../commands/start-stream-command';
import { StreamRepository } from '../../../infrastructure/stream-repository';
import { Stream } from '../../stream/models/stream';

export class StartStreamCommandHandler {
  constructor() {}

  public async execute(command: StartStreamCommand): Promise<void> {
    const streamData = await StreamRepository.loadStream(command.streamDate);

    if (streamData) {
      throw new Error('Stream already exists');
    }

    const stream = Stream.create(command.streamDate);
    await StreamRepository.saveStream(stream);

    console.log(`Stream started for date: ${command.streamDate}`);
  }
}
