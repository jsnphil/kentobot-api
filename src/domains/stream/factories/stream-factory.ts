import { generateStreamDate } from '@utils/utilities';
import { Stream } from '../models/stream';
import { StreamRepository } from '../../../repositories/stream-repository';

export class StreamFactory {
  // TODO Need to split this between create and load?
  public static async createStream(): Promise<Stream> {
    const streamDate = generateStreamDate();
    const streamData = await StreamRepository.loadStream(streamDate);

    if (!streamData) {
      throw new Error('Stream not found');
    }

    return Stream.load(streamData);
  }
}
