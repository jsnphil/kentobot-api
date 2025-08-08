import { Logger } from '@aws-lambda-powertools/logger';
import { UserSubscribedEvent } from '../../domains/twitch/events/user-subscribed-event';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpType } from '../../types/song-request';
import { BumpSongCommand } from '@commands/bump-song-command';

const logger = new Logger();

export const handler = async (event: UserSubscribedEvent): Promise<void> => {
  logger.logEventIfEnabled(event);
  // ...existing code...

  logger.info('Received UserSubscribedEvent:', event);
  logger.info('Execute the song-bump command');

  const { username, isGift } = event.payload;

  if (isGift) {
    logger.info(
      'Gift subscription detected, skipping song bump for:',
      username
    );
    return;
  }

  const commandHandler = new BumpSongCommandHandler();
  const command = new BumpSongCommand(BumpType.Sub, username);
  await commandHandler.execute(command);
};
