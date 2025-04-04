import { RequestSongCommandHandler } from './request-song-command-handler';
import { RequestSongCommand } from '../commands/request-song-command';
import { StreamRepository } from '../repositories/stream-repository';
import { Song } from '../models/song';
import { Stream } from '../models/stream';
import { generateStreamDate } from '@utils/utilities';

jest.mock('../repositories/stream-repository');
jest.mock('../models/song');
jest.mock('../models/stream');
jest.mock('@utils/utilities');

describe('RequestSongCommandHandler', () => {
  let handler: RequestSongCommandHandler;

  beforeEach(() => {
    handler = new RequestSongCommandHandler();
  });

  it('should throw an error if the stream is not found', async () => {
    (generateStreamDate as jest.Mock).mockReturnValue('2023-01-01');
    (StreamRepository.loadStream as jest.Mock).mockResolvedValue(null);

    const command = new RequestSongCommand('Syl', 'song123');

    await expect(handler.execute(command)).rejects.toThrow('Stream not found');
  });

  it('should add a song to the stream queue and save the stream', async () => {
    const mockStreamData = { id: 'stream123' };
    const mockStream = {
      addSongToQueue: jest.fn()
    };
    const mockSong = { id: 'song123', requestedBy: 'user123' };

    (generateStreamDate as jest.Mock).mockReturnValue('2023-01-01');
    (StreamRepository.loadStream as jest.Mock).mockResolvedValue(
      mockStreamData
    );
    (Stream.load as jest.Mock).mockReturnValue(mockStream);
    (Song.create as jest.Mock).mockResolvedValue(mockSong);

    const command = new RequestSongCommand('song123', 'Dalinar');

    const result = await handler.execute(command);

    expect(generateStreamDate).toHaveBeenCalled();
    expect(StreamRepository.loadStream).toHaveBeenCalledWith('2023-01-01');
    expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
    expect(Song.create).toHaveBeenCalledWith('Dalinar', 'song123');
    expect(mockStream.addSongToQueue).toHaveBeenCalledWith(mockSong);
    expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
    expect(result).toBe(mockSong);
  });
});
