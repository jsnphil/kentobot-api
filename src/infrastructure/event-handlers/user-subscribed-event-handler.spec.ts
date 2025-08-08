import { UserSubscribedEvent } from '@domains/twitch/events/user-subscribed-event';
import { handler } from './user-subscribed-event-handler';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpType } from '../../types/song-request';
import { StreamFactory } from '@domains/stream/factories/stream-factory';

jest.mock('@domains/stream/factories/stream-factory');
jest.mock('@repositories/stream-repository');

describe('user-subscribed-event-handler', () => {
  it('should handle user subscribed events', async () => {
    // Arrange
    const event: UserSubscribedEvent = {
      type: 'user-subscribed',
      occurredAt: new Date().toISOString(),
      source: 'twitch',
      version: 1,
      payload: {
        username: 'KaladinStormblessed',
        isGift: false,
        userLogin: 'KaladinStormblessed'
      }
    };

    const mockStream = {
      bumpSongForUser: jest.fn().mockResolvedValue(undefined)
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    // Mock BumpSongCommandHandler
    const bumpSongCommandHandlerSpy = jest.spyOn(
      BumpSongCommandHandler.prototype,
      'execute'
    );

    // Act
    await handler(event);

    // Assert
    expect(bumpSongCommandHandlerSpy).toHaveBeenCalledWith({
      requestedBy: 'KaladinStormblessed',
      bumpType: BumpType.Sub
    });
  });

  it('should not handle user subscribed events for gift subscriptions', async () => {
    // Arrange
    const event: UserSubscribedEvent = {
      type: 'user-subscribed',
      occurredAt: new Date().toISOString(),
      source: 'twitch',
      version: 1,
      payload: {
        username: 'KaladinStormblessed',
        isGift: true,
        userLogin: 'KaladinStormblessed'
      }
    };

    const mockStream = {
      bumpSongForUser: jest.fn().mockResolvedValue(undefined)
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    // Mock BumpSongCommandHandler
    const bumpSongCommandHandlerSpy = jest.spyOn(
      BumpSongCommandHandler.prototype,
      'execute'
    );

    // Act
    await handler(event);

    // Assert
    expect(bumpSongCommandHandlerSpy).not.toHaveBeenCalled();
  });
});
