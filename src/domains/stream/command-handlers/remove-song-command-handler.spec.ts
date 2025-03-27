import { RemoveSongCommandHandler } from './remove-song-command-handler';
import { StreamRepository } from '../repositories/stream-repository';
import { Stream } from '../models/stream';

jest.mock('../repositories/stream-repository');
jest.mock('../models/stream');

describe('RemoveSongCommandHandler', () => {
    let removeSongCommandHandler: RemoveSongCommandHandler;

    beforeEach(() => {
        removeSongCommandHandler = new RemoveSongCommandHandler();
    });

    it('should remove a song from the queue successfully', async () => {
        const mockStreamData = { id: 'stream1', songs: ['song1', 'song2'] };
        const mockStream = {
            removeSongFromQueue: jest.fn(),
        };

        (StreamRepository.loadStream as jest.Mock).mockResolvedValue(mockStreamData);
        (Stream.load as jest.Mock).mockReturnValue(mockStream);
        (StreamRepository.saveStream as jest.Mock).mockResolvedValue(undefined);

        const result = await removeSongCommandHandler.execute({ songId: 'song1' });

        expect(StreamRepository.loadStream).toHaveBeenCalled();
        expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
        expect(mockStream.removeSongFromQueue).toHaveBeenCalledWith('song1');
        expect(StreamRepository.saveStream).toHaveBeenCalledWith(mockStream);
        expect(result).toEqual({ songId: 'song1' });
    });

    it('should throw an error if the stream is not found', async () => {
        (StreamRepository.loadStream as jest.Mock).mockResolvedValue(null);

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
            removeSongFromQueue: jest.fn().mockRejectedValue(new Error('Removal failed')),
        };

        (StreamRepository.loadStream as jest.Mock).mockResolvedValue(mockStreamData);
        (Stream.load as jest.Mock).mockReturnValue(mockStream);

        await expect(
            removeSongCommandHandler.execute({ songId: 'song1' })
        ).rejects.toThrow('Removal failed');

        expect(StreamRepository.loadStream).toHaveBeenCalled();
        expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
        expect(mockStream.removeSongFromQueue).toHaveBeenCalledWith('song1');
        expect(StreamRepository.saveStream).not.toHaveBeenCalled();
    });
});