import { StartStreamCommand } from '@commands/start-stream-command';
import { StreamRepository } from '@repositories/stream-repository';
import { Stream } from '@domains/stream/models/stream';
import { Logger } from '@aws-lambda-powertools/logger';

export class StartStreamCommandHandler {
  logger = new Logger({ serviceName: 'add-song-to-queue-event-handler' });

  constructor() {}

  public async execute(command: StartStreamCommand): Promise<void> {
    const streamData = await StreamRepository.loadStream(command.streamDate);

    if (streamData) {
      throw new Error('Stream already exists');
    }

    const stream = Stream.create(command.streamDate);
    await StreamRepository.saveStream(stream);

    this.logger.info(`Stream started for date: ${command.streamDate}`);
  }
}
