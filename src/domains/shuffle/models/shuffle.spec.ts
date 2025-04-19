import { Shuffle } from './shuffle';

describe('Shuffle', () => {
  const streamId = 'stream123';
  const openedAt = new Date();
  const previousWinners = ['Kelsier'];

  let shuffle: Shuffle;

  beforeEach(() => {
    shuffle = new Shuffle(streamId, openedAt);
  });

  describe('start', () => {
    it('should create a new Shuffle instance', () => {
      const newShuffle = Shuffle.create(streamId, openedAt);
      expect(newShuffle).toBeInstanceOf(Shuffle);
    });
  });

  describe('isOpen', () => {
    it('should return true if shuffle is open and within duration', () => {
      const shuffle = Shuffle.create(streamId, openedAt);
      shuffle.start();

      expect(shuffle.isOpen).toBe(true);
    });

    it('should return false if shuffle is closed', () => {
      shuffle.close();
      expect(shuffle.isOpen).toBe(false);
    });

    it('should return false if duration has passed', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 60001));
      expect(shuffle.isOpen).toBe(false);
    });
  });

  /*
  describe('join', () => {
    it('should throw an error if shuffle is not open', () => {
      shuffle.close();
      expect(() => shuffle.join('Vin', 'song123')).toThrow(
        'Shuffle is not open.'
      );
    });

    it('should allow a user to join if shuffle is open', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 30000));
      shuffle.join('Vin', 'song123');
      expect(shuffle.getAllParticipants()).toEqual([
        { user: 'Vin', songId: 'song123' }
      ]);
    });

    it('should throw an error if user is on cooldown', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000));
      expect(() => shuffle.join('Vin', 'song123')).toThrow(
        'User is on cooldown.'
      );
    });

    it('should throw an error if user already joined', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      shuffle.join('Vin', 'song123');
      expect(() => shuffle.join('Vin', 'song456')).toThrow(
        'User already entered.'
      );
    });
  });*/

  describe('close', () => {
    it('should close the shuffle', () => {
      shuffle.close();
      expect(shuffle.isOpen).toBe(false);
    });
  });

  /*
  describe('selectWinner', () => {
    it('should select a winner from participants', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      shuffle.join('Vin', 'song123');
      shuffle.join('Elend', 'song456');
      const winner = shuffle.selectWinner();
      expect(['Vin', 'Elend']).toContain(winner?.user);
    });

    it('should return null if no participants', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      const winner = shuffle.selectWinner();
      expect(winner).toBeNull();
    });

    it('should close the shuffle if it is open', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      shuffle.selectWinner();
      expect(shuffle.isOpen).toBe(false);
    });
  });

  describe('getWinner', () => {
    it('should return the selected winner', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      shuffle.join('Vin', 'song123');
      shuffle.selectWinner();
      expect(shuffle.getWinner()).not.toBeNull();
    });

    it('should return null if no winner is selected', () => {
      expect(shuffle.getWinner()).toBeNull();
    });
  });

  describe('getAllParticipants', () => {
    it('should return all participants', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      shuffle.join('Vin', 'song123');
      shuffle.join('Elend', 'song456');
      expect(shuffle.getAllParticipants()).toEqual([
        { user: 'Vin', songId: 'song123' },
        { user: 'Elend', songId: 'song456' }
      ]);
    });

    it('should return an empty array if no participants', () => {
      expect(shuffle.getAllParticipants()).toEqual([]);
    });
  });

  describe('getCountdownRemaining', () => {
    it('should return the remaining time in milliseconds', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 1000), []);
      expect(shuffle.getCountdownRemaining()).toBeGreaterThan(0);
    });

    it('should return 0 if duration has passed', () => {
      shuffle = Shuffle.start(streamId, new Date(Date.now() - 60001), []);
      expect(shuffle.getCountdownRemaining()).toBe(0);
    });
  });

  describe('isOnCooldown', () => {
    it('should return true if user is on cooldown', () => {
      expect(shuffle.isOnCooldown('Kelsier')).toBe(true);
    });

    it('should return false if user is not on cooldown', () => {
      expect(shuffle.isOnCooldown('Vin')).toBe(false);
    });
  });*/

  describe('getStreamId', () => {
    it('should return the stream ID', () => {
      expect(shuffle.getStreamId()).toBe(streamId);
    });
  });
});
