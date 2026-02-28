import { SavePlayedSongCommandHandler } from './save-played-song-command-handler';
import { SavePlayedSongCommand } from '@commands/save-played-song-command';
import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { StreamRepository } from '@repositories/stream-repository';
import { Song } from '@domains/stream/models/song';
import { SongRequestStatus } from '../types/song-request';
import { vi, describe, beforeEach, it, expect } from 'vitest';

vi.mock('@domains/stream/factories/stream-factory');
vi.mock('@repositories/stream-repository');
vi.mock('@domains/stream/models/song');

describe('SavePlayedSongCommandHandler', () => {
  let commandHandler: SavePlayedSongCommandHandler;

  beforeEach(() => {
    commandHandler = new SavePlayedSongCommandHandler();
    vi.clearAllMocks();
  });

  it('should save a played song successfully', async () => {
    const mockStream = {
      savePlayedSong: vi.fn()
    };
    const mockCommand = new SavePlayedSongCommand(
      'songId123',
      'Song title',
      'Kaladin',
      300
    );

    (StreamFactory.createStream as any).mockResolvedValue(mockStream);
    (Song.load as any).mockReturnValue({
      id: 'songId123',
      requestedBy: 'Kaladin',
      title: 'Song title',
      status: SongRequestStatus.PLAYED,
      duration: 300
    });

    await commandHandler.execute(mockCommand);

    expect(mockStream.savePlayedSong).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'songId123',
        requestedBy: 'Kaladin',
        title: 'Song title',
        status: SongRequestStatus.PLAYED,
        duration: 300
      })
    );
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });

  it('should throw an error if StreamFactory fails', async () => {
    const mockCommand = new SavePlayedSongCommand(
      'songId123',
      'user123',
      'Test Song',
      300
    );

    (StreamFactory.createStream as any).mockRejectedValue(
      new Error('Stream creation failed')
    );

    await expect(commandHandler.execute(mockCommand)).rejects.toThrow(
      'Stream creation failed'
    );

    expect(StreamFactory.createStream).toHaveBeenCalled();
    expect(Song.load).not.toHaveBeenCalled();
    expect(StreamRepository.saveStream).not.toHaveBeenCalled();
  });

  it('should throw an error if saving the stream fails', async () => {
    const mockStream = {
      savePlayedSong: vi.fn()
    };
    const mockCommand = new SavePlayedSongCommand(
      'songId123',
      'Song title',
      'Shallan',
      300
    );

    (StreamFactory.createStream as any).mockResolvedValue(mockStream);
    (Song.load as any).mockReturnValue({
      id: 'songId123',
      requestedBy: 'Shallan',
      title: 'Song title',
      status: SongRequestStatus.PLAYED,
      duration: 300
    });
    (StreamRepository.saveStream as any).mockRejectedValue(
      new Error('Failed to save stream')
    );

    await expect(commandHandler.execute(mockCommand)).rejects.toThrow(
      'Failed to save stream'
    );

    expect(StreamFactory.createStream).toHaveBeenCalled();
    expect(Song.load).toHaveBeenCalledWith(
      'songId123',
      'Shallan',
      'Song title',
      SongRequestStatus.PLAYED,
      300
    );
    expect(mockStream.savePlayedSong).toHaveBeenCalled();
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
  });
});
