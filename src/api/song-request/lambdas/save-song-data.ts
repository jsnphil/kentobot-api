import { Logger } from '@aws-lambda-powertools/logger';
import { EventBridgeEvent, SQSEvent } from 'aws-lambda';
import { SongRepository } from '../../../repositories/song-repository';
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
};

export const saveSongData = async (playedSong: SongPlayedEvent) => {
  logger.info(`Saving song data: ${JSON.stringify(playedSong, null, 2)}`);

  const songDataExists = await songRepository.songExists(playedSong.youtubeId);
  logger.info(`Song exists: ${songDataExists}`);

  const song = {
    youtubeId: playedSong.youtubeId,
    title: playedSong.title,
    length: playedSong.length
  };

  const songPlay = {
    date: new Date(playedSong.played) || new Date().toISOString(),
    requestedBy: playedSong.requestedBy,
    sotnContender: false,
    sotnWinner: false,
    sotsWinner: false
  };

  if (songDataExists) {
    logger.info(`Song exists, saving play data`);

    await songRepository.saveNewSongPlay(playedSong.youtubeId, songPlay);
  } else {
    logger.info('Song does not exist, saving song and play');

    await songRepository.saveNewSong(song, songPlay);
  }
};
