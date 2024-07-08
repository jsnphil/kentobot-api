import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

import {
  AttributeValue,
  ConditionalCheckFailedException,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';
import { Song } from '../types/song-request';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongRepository {
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

  async save(song: Song) {
    console.log(`Saving song request: ${JSON.stringify(song, null, 2)}`);

    const putSongInfoInput: PutItemCommandInput = {
      TableName: table,
      Item: marshall({
        pk: `yt#${song.youtubeId}`,
        sk: 'songInfo',
        youtube_id: song.youtubeId,
        song_length: song.length,
        song_title: song.title,
        gsi_pk1: 'songRequest',
        gsi_sk1: 'songRequest'
      }),
      ConditionExpression:
        'attribute_not_exists(pk) AND attribute_not_exists(sk)'
    };

    console.log(
      `Inserting song info: ${JSON.stringify(putSongInfoInput, null, 2)}`
    );

    try {
      const result = await dynamoDBClient.send(
        new PutItemCommand(putSongInfoInput)
      );
      console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      console.log(`Error: ${JSON.stringify(err, null, 2)}`);
      if (err instanceof ConditionalCheckFailedException) {
        console.log('Song info has already been added, skipping...');
      } else {
        console.error(err);
        throw err;
      }
    }
  }

  //   async getAll(): Promise<Song[]> {
  //     let result: QueryCommandOutput;
  //     let accumulated: Record<string, AttributeValue>[] = [];
  //     let ExclusiveStartKey;

  //     do {
  //       result = await dynamoDBClient.send(
  //         new QueryCommand({
  //           TableName: table,
  //           IndexName: 'gsi1',
  //           ProjectionExpression:
  //             'youtube_id,song_title,song_length,requester,play_date,sotnContender,sk',
  //           KeyConditionExpression: 'gsi_pk1 = :pk and begins_with(gsi_sk1, :sk)',

  //           ExpressionAttributeValues: {
  //             ':pk': {
  //               S: 'songRequest'
  //             },
  //             ':sk': {
  //               S: 'songRequest' // TODO Change this songRequest#songInfo
  //             }
  //           },
  //           ExclusiveStartKey: ExclusiveStartKey
  //         })
  //       );

  //       ExclusiveStartKey = result.LastEvaluatedKey;
  //       accumulated = [...accumulated, ...result.Items!];
  //     } while (result.LastEvaluatedKey);

  //     const songList: Song[] = [];

  //     console.log('Processing results');

  //     console.log(`Count: ${accumulated.length}`);
  //     for (const item of accumulated) {
  //       const unmarshalledItem = unmarshall(item);

  //       songList.push({
  //         youtubeId: unmarshalledItem.youtube_id,
  //         title: unmarshalledItem.song_title,
  //         length: unmarshalledItem.song_length
  //       });
  //     }

  //     return songList;
  //   }
}
