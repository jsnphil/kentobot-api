import { YouTubeVideoResult } from '../services/youtube-service';

export class SongValidator {
  public static validate(songMetadata: YouTubeVideoResult): void {
    // Rule 1: Length should be less than 6 minutes
    if (songMetadata.duration > 360) {
      throw new Error(
        'Song duration is too long. Must be less than 6 minutes.'
      );
    }

    // Rule 2: Song should not be a YouTube live stream
    if (songMetadata.isLive) {
      throw new Error('Video cannot be a live stream');
    }

    // Rule 3: Video should be public
    if (!songMetadata.isPublic) {
      throw new Error('The YouTube video must be public.');
    }

    // Rule 4: Video must be available in the US
    if (!songMetadata.availableInUS) {
      throw new Error('The YouTube video is not available in the US.');
    }

    // Rule 5: Video should be embeddable
    if (!songMetadata.isEmbeddable) {
      throw new Error('The YouTube video cannot be embedded.');
    }
  }
}
