import { SQSEvent } from 'aws-lambda';
import { SongRequest } from '../../types/song-request';
import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { Logger } from '@aws-lambda-powertools/logger';
import { YouTubeService } from '../../services/youtube-service';

const eventBusClient = new EventBridgeClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'processSongHistoryRequest' });

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const songHistoryItem: SongHistoryRequest = JSON.parse(record.body);

    logger.info(`Processing song request: ${songHistoryItem.title}`);

    const songLength = await getSongLength(songHistoryItem.youtubeId);

    for (const play of songHistoryItem.plays) {
      logger.info(`Play by ${play.requester} on ${play.playDate}`);

      const songRequest: SongRequest = {
        youtubeId: songHistoryItem.youtubeId,
        title: songHistoryItem.title,
        length: songLength,
        played: play.playDate,
        requestedBy: play.requester
      };

      const eventResponse = await eventBusClient.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: 'kentobot-api',
              DetailType: 'song-played',
              Detail: JSON.stringify(songRequest),
              EventBusName: process.env.EVENT_BUS_NAME
            }
          ]
        })
      );

      if (eventResponse.FailedEntryCount) {
        logger.error(
          `Failed to send event for ${songRequest.title} - ${songRequest.played}`
        );

        logger.error(JSON.stringify(eventResponse));

        throw new Error('Failed to process song history item(s)');
      }
    }
  }
};

const getSongLength = async (youtubeId: string) => {
  const result = await YouTubeService.getVideo(youtubeId);

  if (result) {
    return result.duration;
  }

  return 0;
};
