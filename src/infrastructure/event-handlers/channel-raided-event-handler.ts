import { Logger } from '@aws-lambda-powertools/logger';
import { BumpSongCommandHandler } from '@command-handlers/bump-song-command-handler';
import { BumpSongCommand } from '@commands/bump-song-command';
import { ChannelRaidedEvent } from '@domains/twitch/events/channel-raided-event';
import { BumpType } from '../../types/song-request';

const logger = new Logger();

export const handler = async (event: ChannelRaidedEvent): Promise<void> => {
  logger.logEventIfEnabled(event);

  const { raiderUsername } = event.payload;

  const commandHandler = new BumpSongCommandHandler();
  const command = new BumpSongCommand(BumpType.Raid, raiderUsername);
  await commandHandler.execute(command);
};
