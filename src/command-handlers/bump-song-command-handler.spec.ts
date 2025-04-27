import { BumpSongCommandHandler } from './bump-song-command-handler';
import { BumpSongCommand } from '@commands/bump-song-command';
import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { StreamRepository } from '@repositories/stream-repository';
import { BumpType } from '../types/song-request';

jest.mock('@domains/stream/factories/stream-factory');
jest.mock('@repositories/stream-repository');

describe('BumpSongCommandHandler', () => {
  let handler: BumpSongCommandHandler;

  beforeEach(() => {
    handler = new BumpSongCommandHandler();
  });

  it('should bump a song successfully', async () => {
    const mockStream = {
      bumpSongForUser: jest.fn().mockResolvedValue(undefined)
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    const command: BumpSongCommand = {
      requestdBy: 'Kaladin',
      bumpType: BumpType.Bean,
      position: 1,
      modOverride: false
    };

    await handler.execute(command);

    expect(StreamFactory.createStream).toHaveBeenCalled();
    expect(mockStream.bumpSongForUser).toHaveBeenCalledWith(
      command.requestdBy,
      command.bumpType,
      command.position,
      command.modOverride
    );
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });

  it('should throw an error if StreamFactory fails', async () => {
    (StreamFactory.createStream as jest.Mock).mockRejectedValue(
      new Error('Stream creation failed')
    );

    const command: BumpSongCommand = {
      requestdBy: 'Kaladin',
      bumpType: BumpType.Bean,
      position: 1,
      modOverride: false
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Stream creation failed'
    );
    expect(StreamFactory.createStream).toHaveBeenCalled();
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if bumpSongForUser fails', async () => {
    const mockStream = {
      bumpSongForUser: jest
        .fn()
        .mockRejectedValue(new Error('Bump song failed'))
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    const command: BumpSongCommand = {
      requestdBy: 'Kaladin',
      bumpType: BumpType.Bean,
      position: 1,
      modOverride: false
    };

    await expect(handler.execute(command)).rejects.toThrow('Bump song failed');
    expect(mockStream.bumpSongForUser).toHaveBeenCalledWith(
      command.requestdBy,
      command.bumpType,
      command.position,
      command.modOverride
    );
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if StreamRepository.saveStream fails', async () => {
    const mockStream = {
      bumpSongForUser: jest.fn().mockResolvedValue(undefined)
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);
    (StreamRepository.saveStream as jest.Mock).mockRejectedValue(
      new Error('Save stream failed')
    );

    const command: BumpSongCommand = {
      requestdBy: 'Kaladin',
      bumpType: BumpType.Bean,
      position: 1,
      modOverride: false
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Save stream failed'
    );
    expect(mockStream.bumpSongForUser).toHaveBeenCalledWith(
      command.requestdBy,
      command.bumpType,
      command.position,
      command.modOverride
    );
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });
});
