import { Command } from '@commands/command';
import { AddSongToHistoryCommand } from '@commands/stream/add-song-to-history-command';
import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { Song } from '@domains/stream/models/song';
import { StreamRepository } from '@repositories/stream-repository';
import { SongRequestStatus } from '../types/song-request';
import { Logger } from '@aws-lambda-powertools/logger';

export class StreamCommandHandler {
  private logger = new Logger({
    serviceName: 'stream-command-handler'
  });

  public async execute(command: Command): Promise<string | void> {
    if (command instanceof AddSongToHistoryCommand) {
      await this.handleAddSongToHistoryCommand(command);
    }
  }

  private async handleAddSongToHistoryCommand(
    command: AddSongToHistoryCommand
  ): Promise<void> {
    // TODO Change to a loadStream and throw error if not found
    const stream = await StreamFactory.createStream();

    const { songId, songTitle, requestedBy, duration } = command;
    const song = Song.load(
      songId,
      requestedBy,
      songTitle,
      SongRequestStatus.PLAYED,
      duration
    );

    stream.addSongToHistory(song);
    await StreamRepository.saveStream(stream);
  }
}
