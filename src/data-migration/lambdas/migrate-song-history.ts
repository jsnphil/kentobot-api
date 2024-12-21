import { Logger } from '@aws-lambda-powertools/logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { streamToString } from '../../utils/utilities';
import { Readable } from 'stream';
import { searchForVideo } from '../../utils/youtube-client';
import { parse, toSeconds } from 'iso8601-duration';

const logger = new Logger({ serviceName: 'migrateSongHistory' });
const s3Client = new S3Client({ region: 'us-east-1' });

interface SongData {
  readonly generated: string;
  readonly count: number;
  readonly requests: Request[];
}

interface Request {
  readonly youtubeId: string;
  readonly title: string;
  readonly plays: Play[];
}

interface Play {
  readonly playDate: string;
  readonly requester: string;
}

export const handler = async (event: S3Event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const s3Data = record.s3;

    if (s3Data.object.key === '.gitkeep') {
      console.log('Skipping .gitkeep file');
      continue;
    }

    logger.info(
      `Object to process: ${s3Data.bucket.name}/${s3Data.object.key}`
    );

    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3Data.bucket.name,
        Key: s3Data.object.key
      })
    );

    if (s3Response && s3Response.Body) {
      const data = await streamToString(s3Response.Body as Readable);
      const songData: SongData = JSON.parse(data);

      logger.info(`Processing song data: ${songData.count} records`);
      await processData(songData);
    }
  }
};

const processData = async (data: SongData) => {
  const requests = data.requests;

  let songs: string[] = [];
  let songRequestProcessed = 0;
  let songsPlaysProcessed = 0;
  const checkedSongs = new Map<string, number>();

  logger.info('Starting processing of song data');
  requests.map(async (request: Request) => {
    // logger.info(`Processing request: ${request.youtubeId} - ${request.title}`);

    songRequestProcessed++;
    request.plays.map(async (play: Play) => {
      songs.push(
        `${request.youtubeId},${request.title},${play.playDate},${play.requester},${songLength}`
      );
      songsPlaysProcessed++;
    });
  });

  logger.info(
    `Processed ${songRequestProcessed} song requests, ${songsPlaysProcessed} song plays`
  );
};

// TODO Move the queue handler
// const getSongLength = async (youtubeId: string) => {
//   // TODO Will need to get the API key from SSM

//   const videos = await searchForVideo(youtubeId);

//   if (!videos || videos.length === 0) {
//     return 0;
//   }

//   const duration = videos[0].contentDetails.duration;
//   return toSeconds(parse(duration));
// };
