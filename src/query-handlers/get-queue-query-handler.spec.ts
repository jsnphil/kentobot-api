import { StreamRepository } from '../domains/stream/repositories/stream-repository';
import { Stream } from '../domains/stream/models/stream';
import { GetQueueRequest } from '../queries/get-queue-request';
import { SongRequestStatus } from '../types/song-request';
import { StreamFactory } from '../domains/stream/factories/stream-factory';
import { GetQueueRequestHandler } from './get-queue-query-handler';

jest.mock('../domains/stream/repositories/stream-repository');
jest.mock('../domains/stream/models/stream');
jest.mock('@utils/utilities');

describe('GetQueryRequestHandler', () => {
  let getQueueRequestHandler: GetQueueRequestHandler;

  beforeEach(() => {
    getQueueRequestHandler = new GetQueueRequestHandler();
  });

  it('should return the song queue when the stream exists', async () => {
    const mockStreamDate = '2023-10-01';
    const mockSongQueue = {
      getSongs: jest.fn().mockReturnValue([
        {
          id: '1',
          title: 'Song 1',
          requestedBy: 'Vin',
          duration: 300,
          status: SongRequestStatus.QUEUED
        },
        {
          id: '2',
          title: 'Song 2',
          requestedBy: 'Kelsier',
          duration: 300,
          status: SongRequestStatus.QUEUED
        }
      ])
    };

    const streamFactoryMock = jest
      .spyOn(StreamFactory, 'createStream')
      .mockResolvedValue({
        getSongQueue: jest.fn().mockReturnValue(mockSongQueue)
      } as unknown as Stream);

    const songQueue = await getQueueRequestHandler.execute(
      new GetQueueRequest(mockStreamDate)
    );

    expect(songQueue).toBeDefined();
    expect(songQueue.getSongs().length).toEqual(2);
    expect(songQueue.getSongs()[0].title).toEqual('Song 1');
    expect(songQueue.getSongs()[1].title).toEqual('Song 2');
  });

  // it('should return the song queue', async () => {
  //   const mockStreamDate = '2023-01-01';
  //   const mockStreamData = {
  //     id: 'stream1',
  //     songQueue: {
  //       songs: [
  //         {
  //           id: '1',
  //           title: 'Song 1',
  //           requestedBy: 'Vin',
  //           duration: 300,
  //           status: SongRequestStatus.QUEUED
  //         },
  //         {
  //           id: '2',
  //           title: 'Song 2',
  //           requestedBy: 'Kelsier',
  //           duration: 300,
  //           status: SongRequestStatus.QUEUED
  //         },
  //         {
  //           id: '3',
  //           title: 'Song 3',
  //           requestedBy: 'Elend',
  //           duration: 300,
  //           status: SongRequestStatus.QUEUED
  //         }
  //       ]
  //     }
  //   };

  //   const streamFactoryMock = jest.spyOn(StreamFactory, 'createStream');

  //   // (Stream.load as jest.Mock).mockReturnValue(mockStream);

  //   const songQueue = await getQueueRequestHandler.execute(
  //     new GetQueueRequest('2023-10-01')
  //   );

  //   expect(songQueue).toBeDefined();
  //   expect(songQueue.getSongs().length).toEqual(5);
  // });

  it('should throw an error if the stream does not exist', async () => {
    const event = { pathParameters: { streamDate: '2023-10-01' } };

    (StreamRepository.loadStream as jest.Mock).mockResolvedValue(null);

    await expect(
      getQueueRequestHandler.execute(new GetQueueRequest('2023-10-01'))
    ).rejects.toThrow('Stream not found');
  });
});
