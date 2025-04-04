import {
  createNewErrorResponse,
  getSongId,
  padTimeDigits,
  secondsToMinutes
} from './utilities';

describe('utilities', () => {
  describe('createNewErrorResponse', () => {
    it('should return an error response with the provided status code and error message', () => {
      const result = createNewErrorResponse(400, 'Bad Request', [
        'Error message'
      ]);
      expect(result.statusCode).toBe(400);

      const body = JSON.parse(result.body);
      expect(body.code).toBe(400);
      expect(body.message).toBe('Bad Request');
      expect(body.errors).toEqual(['Error message']);
    });
  });

  describe('padTimeDigits', () => {
    it('should return a string with a leading zero if the number is less than 10', () => {
      const result = padTimeDigits(9);
      expect(result).toBe('09');
    });

    it('should return a string with no leading zero if the number is 10 or greater', () => {
      const result = padTimeDigits(10);
      expect(result).toBe('10');
    });
  });

  describe('getSongId', () => {
    it('should return a song ID when present', () => {
      const songId = getSongId({
        songId: 'songId'
      });

      expect(songId).toBe('songId');
    });

    it('should return undefined if there are no path parameters', () => {
      expect(getSongId(null)).toBeUndefined();
    });

    it('should return undefined when there are path parameters but no song ID', () => {
      const songId = getSongId({
        param: 'value'
      });

      expect(songId).toBeUndefined();
    });
  });

  describe('secondsToMinutes ', () => {
    it('should return a string with the minutes and seconds', () => {
      const result = secondsToMinutes(65);
      expect(result).toBe('1:05');
    });
  });
});
