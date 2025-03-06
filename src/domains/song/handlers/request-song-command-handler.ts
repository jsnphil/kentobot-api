import { RequestSongCommand } from '../commands/request-song-command';
import { StreamRepository } from '../../stream/repositories/stream-repository';
import { YouTubeService } from '../../common/services/youtube-service'; // Assuming you have a service for this
import { Song } from '../models/song';
import { Stream } from '../../stream/models/stream';

export class RequestSongCommandHandler {
  private readonly streamRepository: StreamRepository;
  private readonly youtubeService: YouTubeService;

  constructor(
    streamRepository: StreamRepository,
    youtubeService: YouTubeService
  ) {
    this.streamRepository = streamRepository;
    this.youtubeService = youtubeService;
  }

  public async handle(command: RequestSongCommand): Promise<void> {
    const { userId, songUrl } = command;

    // Step 1: Validate the song (length and user can only have 1 song)
    const songMetadata = await this.youtubeService.fetchSongMetadata(songUrl);

    if (!this.isValidSong(songMetadata)) {
      throw new Error('Song is invalid or too long');
    }

    // Step 2: Fetch the current stream (for today)
    const stream = await this.streamRepository.getStreamForToday();

    if (stream.songQueue.songs.includes(userId)) {
      throw new Error('User already has a song in the queue');
    }

    // Step 3: Create Song and add it to the queue
    const song = new Song(
      songMetadata.id,
      userId,
      songMetadata.title,
      'in queue',
      songMetadata.duration
    );

    // Step 4: Add song to queue
    stream.songQueue.addSong(song);

    // Step 5: Save the updated stream
    await this.streamRepository.save(stream);
  }

  private isValidSong(songMetadata: { duration: number }): boolean {
    // Implement song validation logic (duration, etc.)
    return songMetadata.duration <= 360; // Example: song must be less than or equal to 6 minutes
  }
}
