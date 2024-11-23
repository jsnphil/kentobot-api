import { Logger } from '@aws-lambda-powertools/logger';
import { EventBridgeEvent, SQSEvent } from 'aws-lambda';
import { SongRepository } from '../../../repositories/SongRepository';
import { SongPlayedEvent } from '../../../types/song-request';

const logger = new Logger({ serviceName: 'saveSongDataLambda' });
const songRepository = new SongRepository();

export const handler = async (event: SQSEvent) => {
  logger.info(`Received event: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    logger.info(`Processing record: ${JSON.stringify(record)}`);
    const event = JSON.parse(record.body) as EventBridgeEvent<
      'song-played',
      SongPlayedEvent
    >;
    await saveSongData(event.detail);
  }

  throw new Error('Not implemented');
};

const saveSongData = async (playedSong: SongPlayedEvent) => {
  logger.info(`Saving song data: ${JSON.stringify(playedSong, null, 2)}`);

  logger.info(`Saving song: ${playedSong.title}`);

  const songDataExists = await songRepository.songExists(playedSong.youtubeId);
  logger.info(`Song exists: ${songDataExists}`);

  if (songDataExists) {
    logger.info(`Song exists, saving play data`);
  } else {
    logger.info('Song does not exist, saving song and play');
    await songRepository.saveSong(playedSong);
  }

  // TODO Check if the song info exists in the table
  // TODO If yes, insert song play data
  // TODO If no, insert song info and play data in a transaction
  // TODO If write fails, fail the lambda and send record to DLQ
};
