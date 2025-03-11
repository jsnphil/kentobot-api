import { RequestSongCommand } from '../commands/request-song-command';

import { Song } from '../models/song';
import { generateStreamDate } from '@utils/utilities';
import { StreamRepository } from '../../../infrastructure/stream-repository';

export class RequestSongCommandHandler {
  constructor() {}

  public async execute(command: RequestSongCommand): Promise<Song> {
    const { requestedBy, songId } = command;

    const streamDate = generateStreamDate();
    const stream = await StreamRepository.loadStream(streamDate);

    if (!stream) {
      throw new Error('Stream not found');
    }

    const song = await Song.create(songId, requestedBy);
    await stream.addSongToQueue(song);

    await StreamRepository.saveStream(stream);

    return song;
  }
}
