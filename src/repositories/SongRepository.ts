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
        // TODO Check first reason for the increment update

        const reason = reasons[1];

        console.log(reason);
        if (reason.Code === 'ConditionalCheckFailed') {
          console.log('Song play already exists, skipping...');
          logger.warn('Song play already exists, skipping...');
          console.log('After the logger');
        }
      }
    }
  }

  //   async get(youtubeId: string): Promise<Song | undefined> {
  //     const { Items } = await dynamoDBClient.send(
  //       new QueryCommand({
  //         TableName: process.env.STREAM_DATA_TABLE!,
  //         KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
  //         ExpressionAttributeValues: {
  //           ':pk': {
  //             S: `yt#${youtubeId}`
  //           },
  //           ':sk': {
  //             S: 'songRequest'
  //           }
  //         }
  //       })
  //     );

  //     console.log(`Items: ${JSON.stringify(Items, null, 2)}`);

  //     if (Items?.length != 0) {
  //       const songInfoRecord = unmarshall(
  //         Items!.filter((item) => {
  //           const unmarshalledItem = unmarshall(item);
  //           return unmarshalledItem.sk.startsWith('songRequest#yt');
  //         })[0]
  //       );

  //       const song = new Song(
  //         songInfoRecord.youtube_id,
  //         songInfoRecord.song_title,
  //         songInfoRecord.song_length
  //       );

  //       return song;
  //     } else {
  //       return undefined;
  //     }
  //   }

  // async save(song: Song) {
  //   console.log(`Saving song request: ${JSON.stringify(song, null, 2)}`);

  //   const putSongInfoInput: PutItemCommandInput = {
  //     TableName: table,
  //     Item: marshall({
  //       pk: `yt#${song.youtubeId}`,
  //       sk: 'songInfo',
  //       youtube_id: song.youtubeId,
  //       song_length: song.length,
  //       song_title: song.title,
  //       gsi_pk1: 'songRequest',
  //       gsi_sk1: 'songRequest'
  //     }),
  //     ConditionExpression:
  //       'attribute_not_exists(pk) AND attribute_not_exists(sk)'
  //   };

  //   console.log(
  //     `Inserting song info: ${JSON.stringify(putSongInfoInput, null, 2)}`
  //   );

  //   try {
  //     const result = await dynamoDBClient.send(
  //       new PutItemCommand(putSongInfoInput)
  //     );
  //     console.log(`Result: ${JSON.stringify(result, null, 2)}`);
  //     console.log('Song info saved successfully');
  //   } catch (err) {
  //     console.log(`Error: ${JSON.stringify(err, null, 2)}`);
  //     if (err instanceof ConditionalCheckFailedException) {
  //       console.log('Song info has already been added, skipping...');
  //     } else {
  //       console.error(err);
  //       throw new Error('Failed to save song info');
  //     }
  //   }
  // }

  // async getAll(): Promise<Song[]> {
  //   let result: QueryCommandOutput;
  //   let accumulated: Record<string, AttributeValue>[] = [];
  //   let ExclusiveStartKey;

  //   do {
  //     result = await dynamoDBClient.send(
  //       new QueryCommand({
  //         TableName: table,
  //         IndexName: 'gsi1',
  //         ProjectionExpression:
  //           'youtube_id,song_title,song_length,requester,play_date,sotnContender,sk',
  //         KeyConditionExpression: 'gsi_pk1 = :pk and begins_with(gsi_sk1, :sk)',

  //         ExpressionAttributeValues: {
  //           ':pk': {
  //             S: 'songRequest'
  //           },
  //           ':sk': {
  //             S: 'songRequest' // TODO Change this songRequest#songInfo
  //           }
  //         },
  //         ExclusiveStartKey: ExclusiveStartKey
  //       })
  //     );

  //     ExclusiveStartKey = result.LastEvaluatedKey;
  //     accumulated = [...accumulated, ...result.Items!];
  //   } while (result.LastEvaluatedKey);

  //   const songList: Song[] = [];

  //   console.log('Processing results');

  //   console.log(`Count: ${accumulated.length}`);
  //   for (const item of accumulated) {
  //     const unmarshalledItem = unmarshall(item);

  //     songList.push({
  //       youtubeId: unmarshalledItem.youtube_id,
  //       title: unmarshalledItem.song_title,
  //       length: unmarshalledItem.song_length
  //     });
  //   }

  //   return songList;
  // }
}
