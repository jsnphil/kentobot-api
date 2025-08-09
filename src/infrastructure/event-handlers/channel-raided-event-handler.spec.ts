import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpSongCommand } from '@commands/bump-song-command';
import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { ChannelRaidedEvent } from '@domains/twitch/events/channel-raided-event';
import { handler } from './channel-raided-event-handler';
import { BumpType } from '../../types/song-request';

jest.mock('@domains/stream/factories/stream-factory');
jest.mock('@repositories/stream-repository');

describe('Channel raided event handler', () => {
  let bumpSongCommandHandlerSpy: jest.SpyInstance<
    Promise<void>,
    [command: BumpSongCommand],
    any
  >;

  beforeEach(() => {
    jest.resetAllMocks();

    const mockStream = {
      bumpSongForUser: jest.fn().mockResolvedValue(undefined)
    };
    (StreamFactory.createStream as jest.Mock).mockResolvedValue(mockStream);

    bumpSongCommandHandlerSpy = jest.spyOn(
      BumpSongCommandHandler.prototype,
      'execute'
    );
  });

  it('should execute a raid bump for a channel-raided event', async () => {
    const event: ChannelRaidedEvent = {
      type: 'channel-raided',
      source: 'twitch',
      version: 1,
      occurredAt: new Date().toISOString(),
      payload: {
        raiderUserLogin: 'kaladin',
        raiderUsername: 'Kaladin',
        viewerCount: 100
      }
    };

    await handler(event);

    expect(bumpSongCommandHandlerSpy).toHaveBeenCalledWith({
      requestedBy: 'Kaladin',
      bumpType: BumpType.Raid
    });
  });
});
