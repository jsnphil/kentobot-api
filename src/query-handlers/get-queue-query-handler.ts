import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { GetQueueRequest } from '@queries/get-queue-request';

export class GetQueueRequestHandler {
  public async execute(query: GetQueueRequest) {
    const stream = await StreamFactory.createStream();

    if (!stream) throw new Error('Stream not found');

    return stream.getSongQueue();
  }
}
