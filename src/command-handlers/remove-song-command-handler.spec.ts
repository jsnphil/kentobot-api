import { RemoveSongCommandHandler } from './remove-song-command-handler';
import { StreamRepository } from '@repositories/stream-repository';
import { Stream } from '@domains/stream/models/stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repositories/stream-repository');
vi.mock('@domains/stream/models/stream');

describe('RemoveSongCommandHandler', () => {
  let removeSongCommandHandler: RemoveSongCommandHandler;

  beforeEach(() => {
    removeSongCommandHandler = new RemoveSongCommandHandler();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should remove a song from the queue successfully', async () => {
    const mockStreamData = { id: 'stream1', songs: ['song1', 'song2'] };
    const mockStream = {
      removeSongFromQueue: vi.fn()
    };

    (StreamRepository.loadStream as any).mockResolvedValue(mockStreamData);
    (Stream.load as any).mockReturnValue(mockStream);
    (StreamRepository.saveStream as any).mockResolvedValue(undefined);

    const result = await removeSongCommandHandler.execute({ songId: 'song1' });

    expect(StreamRepository.loadStream).toHaveBeenCalled();
    expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
    expect(mockStream.removeSongFromQueue).toHaveBeenCalledWith('song1');
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
    expect(result).toEqual({ songId: 'song1' });
  });

  it('should throw an error if the stream is not found', async () => {
    (StreamRepository.loadStream as any).mockResolvedValue(null);

    await expect(
      removeSongCommandHandler.execute({ songId: 'song1' })
    ).rejects.toThrow('Stream not found');

    expect(StreamRepository.loadStream).toHaveBeenCalled();
    expect(Stream.load).not.toHaveBeenCalled();
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if removing a song fails', async () => {
    const mockStreamData = { id: 'stream1', songs: ['song1', 'song2'] };
    const mockStream = {
      removeSongFromQueue: vi
        .fn()
        .mockRejectedValue(new Error('Removal failed'))
    };

    (StreamRepository.loadStream as any).mockResolvedValue(mockStreamData);
    (Stream.load as any).mockReturnValue(mockStream);

    await expect(
      removeSongCommandHandler.execute({ songId: 'song1' })
    ).rejects.toThrow('Removal failed');

    expect(StreamRepository.loadStream).toHaveBeenCalled();
    expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
    expect(mockStream.removeSongFromQueue).toHaveBeenCalledWith('song1');
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });
});
