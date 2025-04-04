import { Logger } from '@aws-lambda-powertools/logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { streamToString } from '../../utils/utilities';
import { Readable } from 'stream';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

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
      logger.debug('Skipping .gitkeep file');
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
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: process.env.SONG_HISTORY_QUEUE_URL,
        MessageBody: JSON.stringify(request)
      })
    );
  }

  logger.info(`Song requests added to queue`);
};
