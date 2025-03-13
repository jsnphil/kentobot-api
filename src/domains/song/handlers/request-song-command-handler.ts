import { RequestSongCommand } from '../commands/request-song-command';

import { Song } from '../models/song';
import { generateStreamDate } from '@utils/utilities';
import { StreamRepository } from '../../../infrastructure/stream-repository';
import { Stream } from '../../stream/models/stream';

export class RequestSongCommandHandler {
  constructor() {}

  public async execute(command: RequestSongCommand): Promise<Song> {
    const { requestedBy, songId } = command;

    const streamDate = generateStreamDate();
    const streamData = await StreamRepository.loadStream(streamDate);

    if (!streamData) {
      throw new Error('Stream not found');
    }

    const stream = Stream.load(streamData);

    console.log(JSON.stringify(stream, null, 2));

    const song = await Song.create(songId, requestedBy);
    await stream.addSongToQueue(song);

    await StreamRepository.saveStream(stream);

    return song;
  }
}
