import { Stream } from '../domains/stream/models/stream';
import { ToggleShuffleCommand } from '../commands/toggle-shuffle-command';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { ShuffleCommandHandler } from './shuffle-command-handler';
import { ShuffleRepository } from '../domains/stream/repositories/shuffle-repository';
import { Shuffle } from '../domains/shuffle/models/shuffle';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { EnterShuffleCommand } from '../commands/enter-shuffle-command';

const mockDynamoDB = mockClient(DynamoDBClient);

describe('shuffle-command-handler', () => {
  describe('toggle-shuffle', () => {
    it('should open a shuffle', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: { songs: [] },
        songHistory: []
      });
      const mockShuffle = Shuffle.create('stream1', new Date());

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest
        .spyOn(ShuffleRepository, 'getShuffle')
        .mockResolvedValue(mockShuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      const toggleShuffleCommand = new ToggleShuffleCommand('open');

      await commandHandler.execute(toggleShuffleCommand);

      expect(mockShuffle.isOpen).toBe(true);
      expect(saveShuffleSpy).toHaveBeenCalledWith(mockShuffle);
    });

    it('should close a shuffle', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: { songs: [] },
        songHistory: []
      });
      const mockShuffle = Shuffle.create('stream1', new Date());
      mockShuffle.start(); // Start the shuffle first

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest
        .spyOn(ShuffleRepository, 'getShuffle')
        .mockResolvedValue(mockShuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      expect(mockShuffle.isOpen).toBe(true); // Ensure it's open before closing

      const toggleShuffleCommand = new ToggleShuffleCommand('close');

      await commandHandler.execute(toggleShuffleCommand);

      expect(mockShuffle.isOpen).toBe(false);
      expect(saveShuffleSpy).toHaveBeenCalledWith(mockShuffle);
    });
  });

  describe('enter-shuffle', () => {
    it('should enter a user in the shuffle', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: {
          songs: [
            { id: 'song1', title: 'Song 1', requestedBy: 'Vin' },
            { id: 'song2', title: 'Song 2', requestedBy: 'Kaladin' }
          ]
        },
        songHistory: []
      });
      const shuffle = Shuffle.create('stream1', new Date());

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest.spyOn(ShuffleRepository, 'getShuffle').mockResolvedValue(shuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      const command = new EnterShuffleCommand('Vin');

      shuffle.start(); // Start the shuffle first
      await commandHandler.execute(command);

      expect(shuffle.isOpen).toBe(true);
      expect(saveShuffleSpy).toHaveBeenCalledWith(shuffle);
    });

    it('should deny a user without a song in the queue', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: {
          songs: [
            { id: 'song1', title: 'Song 1', requestedBy: 'Vin' },
            { id: 'song2', title: 'Song 2', requestedBy: 'Kaladin' }
          ]
        },
        songHistory: []
      });
      const shuffle = Shuffle.create('stream1', new Date());

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest.spyOn(ShuffleRepository, 'getShuffle').mockResolvedValue(shuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      const command = new EnterShuffleCommand('Adolin');

      shuffle.start(); // Start the shuffle first
      await expect(commandHandler.execute(command)).rejects.toThrow(
        'No song found for user: Adolin'
      );

      expect(saveShuffleSpy).not.toHaveBeenCalledWith();
    });

    it('should deny a user who is in cooldown', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: {
          songs: [
            { id: 'song1', title: 'Song 1', requestedBy: 'Vin' },
            { id: 'song2', title: 'Song 2', requestedBy: 'Kaladin' }
          ]
        },
        songHistory: []
      });
      const shuffle = Shuffle.create('stream1', new Date(), ['Vin']);

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest.spyOn(ShuffleRepository, 'getShuffle').mockResolvedValue(shuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      const command = new EnterShuffleCommand('Vin');

      shuffle.start(); // Start the shuffle first

      await expect(commandHandler.execute(command)).rejects.toThrow(
        'User is on cooldown'
      );

      expect(saveShuffleSpy).not.toHaveBeenCalledWith();
    });

    it('should deny a user when there is no shuffle open', async () => {
      const commandHandler = new ShuffleCommandHandler();

      mockDynamoDB.on(PutCommand).resolves({});

      const mockStream = Stream.load({
        id: 'stream1',
        songQueue: {
          songs: [
            { id: 'song1', title: 'Song 1', requestedBy: 'Vin' },
            { id: 'song2', title: 'Song 2', requestedBy: 'Kaladin' }
          ]
        },
        songHistory: []
      });
      const shuffle = Shuffle.create('stream1', new Date(), ['Vin']);

      jest.spyOn(StreamFactory, 'createStream').mockResolvedValue(mockStream);
      jest.spyOn(ShuffleRepository, 'getShuffle').mockResolvedValue(shuffle);

      const saveShuffleSpy = jest.spyOn(ShuffleRepository, 'save');

      const command = new EnterShuffleCommand('Vin');

      await expect(commandHandler.execute(command)).rejects.toThrow(
        'Shuffle is not open'
      );

      expect(saveShuffleSpy).not.toHaveBeenCalledWith();
    });
  });

  describe('execute', () => {
    it('should throw an error for invalid command type', async () => {
      const commandHandler = new ShuffleCommandHandler();
      const invalidCommand = { type: 'invalid' };

      await expect(commandHandler.execute(invalidCommand)).rejects.toThrow(
        'Invalid command'
      );
    });
  });
});
