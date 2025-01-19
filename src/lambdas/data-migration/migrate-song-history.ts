import { Logger } from '@aws-lambda-powertools/logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { streamToString } from '../../utils/utilities';
import { Readable } from 'stream';
import { searchForVideo } from '../../services/youtube-service';
import { parse, toSeconds } from 'iso8601-duration';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Queue } from 'aws-cdk-lib/aws-sqs';

const logger = new Logger({ serviceName: 'migrateSongHistory' });
const s3Client = new S3Client({ region: 'us-east-1' });
const sqsClient = new SQSClient({ region: 'us-east-1' });

interface SongData {
  readonly generated: string;
  readonly count: number;
  readonly requests: Request[];
}

export const handler = async (event: S3Event) => {
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
  logger.info('Starting processing of song data');

  for (const request of data.requests) {
    // logger.info(`Processing request: ${request.youtubeId} - ${request.title}`);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: process.env.SONG_HISTORY_QUEUE_URL,
        MessageBody: JSON.stringify(request)
      })
    );
  }

  logger.info(`Song requests added to queue`);
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
