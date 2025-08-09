import { Logger } from '@aws-lambda-powertools/logger';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpSongCommand } from '@commands/bump-song-command';
import { StreamFactory } from '@domains/stream/factories/stream-factory';
import { UserRedeemedChannelRewardEvent } from '@domains/twitch/events/user-redeemed-channel-reward';
import { BumpType } from '../../types/song-request';
import { handler } from './channel-points-redeemed-event-handler';

jest.mock('@domains/stream/factories/stream-factory');
jest.mock('@repositories/stream-repository');

describe('Channel Points Redeemed Event Handler', () => {
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

  it('should execute a channel points bump for a point redemption event', async () => {
    const event: UserRedeemedChannelRewardEvent = {
      type: 'channel-point-redemption',
      occurredAt: new Date().toISOString(),
      source: 'twitch',
      version: 1,
      payload: {
        rewardId: 'song-bump',
        username: 'Adolin',
        userLogin: 'adolin',
        rewardTitle: 'Song bump',
        redeemedAt: new Date().toISOString()
      }
    };
    await handler(event);

    expect(bumpSongCommandHandlerSpy).toHaveBeenCalledWith({
      bumpType: BumpType.ChannelPoints,
      requestedBy: 'Adolin'
    });
  });

  it('should not execute a channel points bump for a point redemption event that is not for a song bump reward', async () => {
    const event: UserRedeemedChannelRewardEvent = {
      type: 'channel-point-redemption',
      occurredAt: new Date().toISOString(),
      source: 'twitch',
      version: 1,
      payload: {
        username: 'Adolin',
        userLogin: 'adolin',
        rewardId: 'one-handed',
        rewardTitle: 'One Handed Drum',
        redeemedAt: new Date().toISOString()
      }
    };

    const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

    await handler(event);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Non song bump channel point reward redeemed, skipping...'
    );
  });
});
