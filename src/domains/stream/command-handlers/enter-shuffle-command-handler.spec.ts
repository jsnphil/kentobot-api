import { EnterShuffleCommandHandler } from './enter-shuffle-command-handler';
import { EnterShuffleCommand } from '../commands/enter-shuffle-command';
import { StreamFactory } from '../factories/stream-factory';
import { StreamRepository } from '../repositories/stream-repository';

jest.mock('../factories/stream-factory');
jest.mock('../repositories/stream-repository');

describe('EnterShuffleCommandHandler', () => {
  let handler: EnterShuffleCommandHandler;

  beforeEach(() => {
    handler = new EnterShuffleCommandHandler();
    jest.clearAllMocks();
  });

  it('should execute successfully when valid command is provided', async () => {
    const mockStream = {
      enterShuffle: jest.fn().mockResolvedValue(undefined)
    };

    const command = new EnterShuffleCommand('Vin');

    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    await handler.execute(command);

    expect(StreamFactory.createStream).toHaveBeenCalledTimes(1);
    expect(mockStream.enterShuffle).toHaveBeenCalledWith('Vin');
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });

  it('should throw an error if StreamFactory.createStream fails', async () => {
    const command = new EnterShuffleCommand('Vin');

    (StreamFactory.createStream as jest.Mock).mockRejectedValue(
      new Error('Stream creation failed')
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Stream creation failed'
    );

    expect(StreamFactory.createStream).toHaveBeenCalledTimes(1);
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if stream.enterShuffle fails', async () => {
    const mockStream = {
      enterShuffle: jest
        .fn()
        .mockRejectedValue(new Error('Enter shuffle failed'))
    };
    const command = new EnterShuffleCommand('Vin');

    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    await expect(handler.execute(command)).rejects.toThrow(
      'Enter shuffle failed'
    );

    expect(StreamFactory.createStream).toHaveBeenCalledTimes(1);
    expect(mockStream.enterShuffle).toHaveBeenCalledWith('Vin');
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if StreamRepository.saveStream fails', async () => {
    const mockStream = {
      enterShuffle: jest.fn().mockResolvedValue(undefined)
    };
    const command = new EnterShuffleCommand('Vin');

    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);
    (StreamRepository.saveStream as jest.Mock).mockRejectedValue(
      new Error('Save stream failed')
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Save stream failed'
    );

    expect(StreamFactory.createStream).toHaveBeenCalledTimes(1);
    expect(mockStream.enterShuffle).toHaveBeenCalledWith('Vin');
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });
});
