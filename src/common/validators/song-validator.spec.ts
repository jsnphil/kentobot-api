import { SongValidator } from './song-validator';
import { YouTubeVideoResult } from '../services/youtube-service';

describe('SongValidator', () => {
  const validSongMetadata: YouTubeVideoResult = {
    duration: 300,
    isLive: false,
    isPublic: true,
    availableInUS: true,
    isEmbeddable: true,
    id: 'songId',
    title: 'Song Title'
  };

  describe('validate', () => {
    it('should validate a valid song metadata without throwing an error', () => {
      expect(() => SongValidator.validate(validSongMetadata)).not.toThrow();
    });

    it('should throw an error if the song duration is more than 6 minutes', () => {
      const invalidSongMetadata = { ...validSongMetadata, duration: 400 };
      expect(() => SongValidator.validate(invalidSongMetadata)).toThrow(
        'Song duration is too long. Must be less than 6 minutes.'
      );
    });

    it('should throw an error if the song is a live stream', () => {
      const invalidSongMetadata = { ...validSongMetadata, isLive: true };
      expect(() => SongValidator.validate(invalidSongMetadata)).toThrow(
        'Video cannot be a live stream'
      );
    });

    it('should throw an error if the video is not public', () => {
      const invalidSongMetadata = { ...validSongMetadata, isPublic: false };
      expect(() => SongValidator.validate(invalidSongMetadata)).toThrow(
        'The YouTube video must be public.'
      );
    });

    it('should throw an error if the video is not available in the US', () => {
      const invalidSongMetadata = {
        ...validSongMetadata,
        availableInUS: false
      };
      expect(() => SongValidator.validate(invalidSongMetadata)).toThrow(
        'The YouTube video is not available in the US.'
      );
    });

    it('should throw an error if the video is not embeddable', () => {
      const invalidSongMetadata = { ...validSongMetadata, isEmbeddable: false };
      expect(() => SongValidator.validate(invalidSongMetadata)).toThrow(
        'The YouTube video cannot be embedded.'
      );
    });

    // Edge cases

    it('should validate if the song duration is just under 6 minutes', () => {
      const edgeCaseSongMetadata = { ...validSongMetadata, duration: 359 };
      expect(() => SongValidator.validate(edgeCaseSongMetadata)).not.toThrow();
    });
  });
});
