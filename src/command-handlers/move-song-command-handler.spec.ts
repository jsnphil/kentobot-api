import { MoveSongCommandHandler } from './move-song-command-handler';
import { MoveSongCommand } from '@commands/move-song-command';
import { StreamRepository } from '@repositories/stream-repository';
import { Stream } from '@domains/stream/models/stream';
import { generateStreamDate } from '@utils/utilities';
import { vi, describe, beforeEach, it, expect } from 'vitest';

vi.mock('@repositories/stream-repository');
vi.mock('@domains/stream/models/stream');
vi.mock('@utils/utilities');

describe('MoveSongCommandHandler', () => {
  let moveSongCommandHandler: MoveSongCommandHandler;

  beforeEach(() => {
    moveSongCommandHandler = new MoveSongCommandHandler();
    vi.clearAllMocks();
  });

  it('should move a song to the specified position', async () => {
    const mockStreamDate = '2023-01-01';
    const mockStreamData = { id: 'stream1', songs: [] };
    const mockCommand = new MoveSongCommand('song1', 2);

    (generateStreamDate as any).mockReturnValue(mockStreamDate);
    (StreamRepository.loadStream as any).mockResolvedValue(mockStreamData);
    const mockStream = { moveSong: vi.fn(), id: 'stream1' };
    (Stream.load as any).mockReturnValue(mockStream);

    await moveSongCommandHandler.execute(mockCommand);

    expect(generateStreamDate).toHaveBeenCalled();
    expect(StreamRepository.loadStream).toHaveBeenCalledWith(mockStreamDate);
    expect(mockStream.moveSong).toHaveBeenCalledWith('song1', 2);
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });

  it('should throw an error if the stream is not found', async () => {
    const mockStreamDate = '2023-01-01';
    const mockCommand = new MoveSongCommand('song1', 2);

    (generateStreamDate as any).mockReturnValue(mockStreamDate);
    (StreamRepository.loadStream as any).mockResolvedValue(null);

    await expect(moveSongCommandHandler.execute(mockCommand)).rejects.toThrow(
      'Stream not found'
    );

    expect(generateStreamDate).toHaveBeenCalled();
    expect(StreamRepository.loadStream).toHaveBeenCalledWith(mockStreamDate);
    expect(Stream.load).not.toHaveBeenCalled();
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });
});
