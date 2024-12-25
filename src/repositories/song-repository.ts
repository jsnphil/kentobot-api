import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  ProjectionType,
  QueryCommand,
  QueryCommandOutput,
  TransactionCanceledException,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { SongInfo, SongPlay } from '../types/song-request';
import { Logger } from '@aws-lambda-powertools/logger';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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
                  play_count: 1,
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

  async getAllSongs() {
    let queryCount = 1;
    let lastEvaluatedKey;
    let hasMoreItems = false;

    const songs: SongInfo[] = [];

    do {
      logger.debug(`Querying for songs, iteration ${queryCount++}`);

      const response: QueryCommandOutput = await dynamoDBClient.send(
        new QueryCommand({
          TableName: process.env.STREAM_DATA_TABLE!,
          KeyConditionExpression:
            'gsi_pk1 = :gsi_pk1 AND begins_with(gsi_sk1, :gsi_sk1)',
          IndexName: 'gsi1',
          ExpressionAttributeValues: {
            ':gsi_pk1': { S: 'songRequest' },
            ':gsi_sk1': { S: 'songRequest' }
          },
          ExclusiveStartKey: lastEvaluatedKey
        })
      );

      const items = response.Items;

      if (items) {
        items.forEach(
          (item: AttributeValue | Record<string, AttributeValue>) => {
            const unmarshalledItem = unmarshall(item);

            const songInfo: SongInfo = {
              title: unmarshalledItem.song_title,
              youtubeId: unmarshalledItem.youtube_id,
              length: unmarshalledItem.song_length,
              playCount: unmarshalledItem.play_count
            };
            songs.push(songInfo);
          }
        );
      }

      if (response.LastEvaluatedKey) {
        logger.debug('More songs available');
        lastEvaluatedKey = response.LastEvaluatedKey;
        hasMoreItems = true;
      } else {
        logger.debug('No more songs available');
        hasMoreItems = false;
      }
    } while (hasMoreItems);

    return songs;
  }

  async getSongInfo(youtubeId: string): Promise<SongInfo | undefined> {
    const { Item } = await dynamoDBClient.send(
      new GetItemCommand({
        TableName: table,
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

    if (!Item) {
      return undefined;
    }

    const unmarshalledItem = unmarshall(Item);

    return {
      title: unmarshalledItem.song_title,
      youtubeId: unmarshalledItem.youtube_id,
      length: unmarshalledItem.song_length,
      playCount: unmarshalledItem.play_count
    } as SongInfo;
  }
}
