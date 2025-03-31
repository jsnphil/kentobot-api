import { StreamFactory } from '../factories/stream-factory';
import { GetQueueRequest } from '../queries/get-queue-request';

export class GetQueueRequestHandler {
  public async execute(query: GetQueueRequest) {
    console.log(`GetQueueRequestHandler: ${JSON.stringify(query)}`);

    console.log('Creating stream...');
    const stream = await StreamFactory.createStream();
    console.log('Stream created');

    console.log(`Stream: ${JSON.stringify(stream)}`);

    if (!stream) throw new Error('Stream not found');

    console.log(`Stream: ${JSON.stringify(stream)}`);
    return stream.getSongQueue();
  }
}
