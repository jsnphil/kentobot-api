import { WebSocketService } from '@services/web-socket-service';
import { Logger } from '@aws-lambda-powertools/logger';
import { handler } from './stream-event-handler';
import { StreamEvent } from '../../../types/event-types';

jest.mock('@services/web-socket-service');
jest.mock('@aws-lambda-powertools/logger');

describe('stream-event-handler', () => {
  let webSocketServiceMock: jest.Mocked<WebSocketService>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    webSocketServiceMock =
      new WebSocketService() as jest.Mocked<WebSocketService>;
    loggerMock = new Logger({
      serviceName: 'add-song-to-queue-event-handler'
    }) as jest.Mocked<Logger>;

    (WebSocketService as jest.Mock).mockReturnValue(webSocketServiceMock);
    (Logger as unknown as jest.Mock).mockReturnValue(loggerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should broadcast a song-added message when detailType is song-added-to-queue', async () => {
    const event = {
      'detail-type': StreamEvent.SONG_ADDED_TO_QUEUE,
      detail: {
        songId: '1',
        title: 'Test Song',
        requestedBy: 'User1',
        status: 'queued',
        duration: 300
      }
    };

    const expectedMessage = JSON.stringify({
      event: 'song-added',
      data: {
        song: {
          songId: '1',
          title: 'Test Song',
          requestedBy: 'User1',
          duration: 300,
          status: 'queued'
        }
      }
    });

    const broadcastSpy = jest
      .spyOn(WebSocketService.prototype, 'broadcast')
      .mockImplementation(() => Promise.resolve());

    await handler(event);
    expect(broadcastSpy).toHaveBeenCalledWith(expectedMessage);
  });

  it('should broadcast a song-removed message when detailType is song-removed-from-queue', async () => {
    const event = {
      'detail-type': StreamEvent.SONG_REMOVED_FROM_QUEUE,
      detail: {
        songId: '1'
      }
    };

    const expectedMessage = JSON.stringify({
      event: 'song-removed',
      data: {
        songId: '1'
      }
    });

    const broadcastSpy = jest
      .spyOn(WebSocketService.prototype, 'broadcast')
      .mockImplementation(() => Promise.resolve());

    await handler(event);
    expect(broadcastSpy).toHaveBeenCalledWith(expectedMessage);
  });
});
