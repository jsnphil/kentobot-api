import {
  DynamoDBClient,
  GetItemCommand,
  ProjectionType,
  TransactionCanceledException,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { SongInfo, SongPlay } from '../types/song-request';
import { Logger } from '@aws-lambda-powertools/logger';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const logger = new Logger({ serviceName: 'song-repository' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongRepository {
  async songExists(youtubeId: string): Promise<boolean> {
    logger.info(`Checking if song exists: ${youtubeId}`);

    const { Item } = await dynamoDBClient.send(
      new GetItemCommand({
        TableName: table,
        ProjectionExpression: ProjectionType.KEYS_ONLY,
        Key: {
          pk: {
            S: `yt#${youtubeId}`
          },
          sk: {
            S: 'songInfo'
          }
        }
      })
    );

    return Item !== undefined;
  }

  async saveNewSong(song: SongInfo, songPlay: SongPlay) {
    await dynamoDBClient.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: process.env.STREAM_DATA_TABLE!,
              Item: marshall(
                {
                  pk: `yt#${song.youtubeId}`,
                  sk: 'songInfo',
                  youtube_id: song.youtubeId,
                  song_title: song.title,
                  song_length: song.length,
                  play_count: 0,
                  gsi_pk1: 'songRequest',
                  gsi_sk1: 'songRequest'
                },
                { removeUndefinedValues: true }
              )
            }
          },
          {
            Put: {
              TableName: process.env.STREAM_DATA_TABLE!,
              Item: marshall(
                {
                  pk: `yt#${song.youtubeId}`,
                  sk: `songPlay#date#${songPlay.date.toISOString()}`,
                  requested_by: songPlay.requestedBy,
                  request_date: songPlay.date.toISOString(),
                  sotn_contender: false,
                  sotn_winner: false,
                  sots_winner: false
                },
                { removeUndefinedValues: true }
              )
            }
          }
        ]
      })
    );

    // TODO Surround with try/catch and check for transaction cancellations
  }

  async saveNewSongPlay(songId: string, songPlay: SongPlay) {
    try {
      await dynamoDBClient.send(
        new TransactWriteItemsCommand({
          TransactItems: [
            {
              Update: {
                TableName: process.env.STREAM_DATA_TABLE!,
                Key: {
                  pk: {
                    S: `yt#${songId}`
                  },
                  sk: {
                    S: 'songInfo'
                  }
                },
                UpdateExpression: 'SET play_count = play_count + :inc',
                ExpressionAttributeValues: {
                  ':inc': {
                    N: '1'
                  }
                }
              }
            },
            {
              Put: {
                TableName: process.env.STREAM_DATA_TABLE!,
                Item: marshall(
                  {
                    pk: `yt#${songId}`,
                    sk: `songPlay#date#${songPlay.date.toISOString()}`,
                    requested_by: songPlay.requestedBy,
                    request_date: songPlay.date.toISOString(),
                    sotn_contender: false,
                    sotn_winner: false,
                    sots_winner: false
                  },
                  { removeUndefinedValues: true }
                ),
                ConditionExpression:
                  'attribute_not_exists(pk) AND attribute_not_exists(sk)'
              }
            }
          ]
        })
      );
    } catch (err) {
      const exception = err as TransactionCanceledException;
      const reasons = exception.CancellationReasons;

      if (reasons) {
        if (reasons[0].Code) {
          logger.error(
            `Error updating play count: ${reasons[0].Code}:  ${reasons[0].Message}`
          );

          throw new Error('Error updating play count');
        }

        const reason = reasons[1];

        if (reason.Code === 'ConditionalCheckFailed') {
          logger.warn('Song play already exists, skipping...');
        } else {
          logger.error(
            `Error adding song play: ${reason.Code}: ${reason.Message}`
          );

          throw new Error('Error adding song play');
        }
      }
    }
  }
}
