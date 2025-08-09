import { Logger } from '@aws-lambda-powertools/logger';
import { UserSubscribedEvent } from '../../domains/twitch/events/user-subscribed-event';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpType } from '../../types/song-request';
import { BumpSongCommand } from '@commands/bump-song-command';
import { UserGiftedSubscriptionEvent } from '@domains/twitch/events/user-gifted-subscription-event';
import { UserResubscriptionEvent } from '@domains/twitch/events/user-resubscribed-event';

const logger = new Logger();

export const handler = async (
  event:
    | UserSubscribedEvent
    | UserGiftedSubscriptionEvent
    | UserResubscriptionEvent
): Promise<void> => {
  logger.logEventIfEnabled(event);

  const { username } = event.payload;
  let bumpType: BumpType;

  if (event.type === 'user-subscribed') {
    const { isGift } = event.payload;

    if (isGift) {
      logger.info(
        'Gift subscription detected, skipping song bump for:',
        username
      );
      return;
    }

    bumpType = BumpType.Sub;
  } else if (event.type === 'user-gifted-subscription') {
    bumpType = BumpType.GiftedSub;
  } else if (event.type === 'user-resubscribed') {
    bumpType = BumpType.Sub;
  } else {
    logger.error('Unknown subscription event type, exiting...');
    return;
  }

  const commandHandler = new BumpSongCommandHandler();
  const command = new BumpSongCommand(bumpType, username);
  await commandHandler.execute(command);
};
