import { Shuffle } from './shuffle';
import { ShuffleEntry } from './shuffle-entry';

describe('Shuffle', () => {
  const streamId = 'stream123';
  const openedAt = new Date();
  const previousWinners = ['Kelsier'];

  let shuffle: Shuffle;

  beforeEach(() => {
    shuffle = new Shuffle(streamId, openedAt);
  });

  describe('create', () => {
    it('should create a new Shuffle instance', () => {
      const newShuffle = Shuffle.create(streamId, openedAt);
      expect(newShuffle).toBeInstanceOf(Shuffle);
    });
  });

  describe('load', () => {
    it('should load an existing Shuffle instance', () => {
      const entries = [new ShuffleEntry('Vin', 'song123')];
      const loadedShuffle = Shuffle.load(
        streamId,
        openedAt,
        entries,
        false,
        []
      );

      expect(loadedShuffle).toBeInstanceOf(Shuffle);
      expect(loadedShuffle.getEntries()).toEqual([
        { user: 'Vin', songId: 'song123' }
      ]);
      expect(loadedShuffle.isOpen).toBe(false);
    });

    it('should load an existing Shuffle instance that is open', () => {
      const entries = [new ShuffleEntry('Vin', 'song123')];

      const loadedShuffle = Shuffle.load(streamId, openedAt, entries, true, []);
      expect(loadedShuffle).toBeInstanceOf(Shuffle);
      expect(loadedShuffle.getEntries()).toEqual([
        { user: 'Vin', songId: 'song123' }
      ]);
    });
  });

  describe('start', () => {
    it('should start the shuffle', () => {
      shuffle.start();
      expect(shuffle.isOpen).toBe(true);
    });

    it('should throw an error if shuffle is already open', () => {
      shuffle.start();
      expect(() => shuffle.start()).toThrow('Shuffle is already open.');
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

  describe('join', () => {
    it('should throw an error if shuffle is not open', () => {
      shuffle.close();
      expect(() => shuffle.join('Vin', 'song123')).toThrow(
        'Shuffle is not open.'
      );
    });

    it('should allow a user to join if shuffle is open', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 30000));
      shuffle.start();
      shuffle.join('Vin', 'song123');
      expect(shuffle.getEntries()).toEqual([
        { user: 'Vin', songId: 'song123' }
      ]);
    });

    it('should throw an error if user is on cooldown', () => {
      shuffle = Shuffle.create(
        streamId,
        new Date(Date.now() - 1000),
        previousWinners
      );
      shuffle.start();
      expect(() => shuffle.join('Kelsier', 'song123')).toThrow(
        'User is on cooldown.'
      );
    });

    it('should throw an error if user already joined', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000));
      shuffle.start();
      shuffle.join('Vin', 'song123');
      expect(() => shuffle.join('Vin', 'song456')).toThrow(
        'User already entered.'
      );
    });
  });

  describe('close', () => {
    it('should close the shuffle', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000));
      shuffle.start();
      expect(shuffle.isOpen).toBe(true);

      shuffle.close();
      expect(shuffle.isOpen).toBe(false);
    });
  });

  describe('selectWinner', () => {
    it('should select a winner from participants', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.start();
      shuffle.join('Vin', 'song123');
      const winner = shuffle.selectWinner();
      expect(winner?.getUser()).toBe('Vin');
      expect(winner?.getSongId()).toBe('song123');
    });

    it('should return null if no participants', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.start();
      const winner = shuffle.selectWinner();
      expect(winner).toBeNull();
    });

    it('should close the shuffle if it is open', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.selectWinner();
      expect(shuffle.isOpen).toBe(false);
    });
  });

  describe('getWinner', () => {
    it('should return the selected winner', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.start();
      shuffle.join('Vin', 'song123');
      const winner = shuffle.selectWinner();
      expect(winner?.getUser()).toBe('Vin');
      expect(winner?.getSongId()).toBe('song123');
    });

    it('should return null if no winner is selected', () => {
      expect(shuffle.getWinner()).toBeNull();
    });
  });

  describe('getEntries', () => {
    it('should return all participants', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.start();
      shuffle.join('Vin', 'song123');
      shuffle.join('Elend', 'song456');
      expect(shuffle.getEntries()).toEqual([
        { user: 'Vin', songId: 'song123' },
        { user: 'Elend', songId: 'song456' }
      ]);
    });

    it('should return an empty array if no participants', () => {
      expect(shuffle.getEntries()).toEqual([]);
    });
  });

  describe('getCountdownRemaining', () => {
    it('should return the remaining time in milliseconds', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 1000), []);
      shuffle.start();
      expect(shuffle.getCountdownRemaining()).toBeGreaterThan(0);
    });

    it('should return 0 if duration has passed', () => {
      shuffle = Shuffle.create(streamId, new Date(Date.now() - 60001), []);
      expect(shuffle.getCountdownRemaining()).toBe(0);
    });
  });

  describe('getStreamId', () => {
    it('should return the stream ID', () => {
      expect(shuffle.getStreamId()).toBe(streamId);
    });
  });
});
