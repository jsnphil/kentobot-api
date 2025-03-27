import { StreamFactory } from './stream-factory';
import { StreamRepository } from '../repositories/stream-repository';
import { Stream } from '../models/stream';
import { generateStreamDate } from '@utils/utilities';

jest.mock('../repositories/stream-repository');
jest.mock('../models/stream');
jest.mock('@utils/utilities');

describe('StreamFactory', () => {
    describe('createStream', () => {
        it('should create a stream successfully', async () => {
            const mockStreamDate = '2023-10-01';
            const mockStreamData = { id: 1, name: 'Test Stream' };
            const mockStream = { id: 1, name: 'Test Stream' };

            (generateStreamDate as jest.Mock).mockReturnValue(mockStreamDate);
            (StreamRepository.loadStream as jest.Mock).mockResolvedValue(mockStreamData);
            (Stream.load as jest.Mock).mockReturnValue(mockStream);

            const result = await StreamFactory.createStream();

            expect(generateStreamDate).toHaveBeenCalled();
            expect(StreamRepository.loadStream).toHaveBeenCalledWith(mockStreamDate);
            expect(Stream.load).toHaveBeenCalledWith(mockStreamData);
            expect(result).toEqual(mockStream);
        });

        it('should throw an error if stream data is not found', async () => {
            const mockStreamDate = '2023-10-01';

            (generateStreamDate as jest.Mock).mockReturnValue(mockStreamDate);
            (StreamRepository.loadStream as jest.Mock).mockResolvedValue(null);

            await expect(StreamFactory.createStream()).rejects.toThrow('Stream not found');

            expect(generateStreamDate).toHaveBeenCalled();
            expect(StreamRepository.loadStream).toHaveBeenCalledWith(mockStreamDate);
            expect(Stream.load).not.toHaveBeenCalled();
        });
    });
});