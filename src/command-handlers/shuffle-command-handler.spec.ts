import { Stream } from '../domains/stream/models/stream';
import { ToggleShuffleCommand } from '../commands/toggle-shuffle-command';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { ShuffleCommandHandler } from './shuffle-command-handler';
import { ShuffleRepository } from '../domains/stream/repositories/shuffle-repository';
import { Shuffle } from '../domains/shuffle/models/shuffle';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

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
