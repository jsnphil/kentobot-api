// import {
//   DynamoDBClient,
//   PutItemCommand,
//   PutItemCommandInput,
//   QueryCommand,
//   DynamoDB
// } from '@aws-sdk/client-dynamodb';
// import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
// import { Song } from '../types/song-request';

import {
  DynamoDB,
  PutItemCommand,
  PutItemCommandInput
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SongPlay } from '../types/song-request';

const dynamoDBClient = new DynamoDB({ region: 'us-east-1' });

const table = process.env.STREAM_DATA_TABLE!;

export class SongPlayRepository {
  //   //   async get(youtubeId: string): Promise<Song | undefined> {
  //   //     const { Items } = await dynamoDBClient.send(
  //   //       new QueryCommand({
  //   //         TableName: process.env.STREAM_DATA_TABLE!,
  //   //         KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
  //   //         ExpressionAttributeValues: {
  //   //           ':pk': {
  //   //             S: `yt#${youtubeId}`
  //   //           },
  //   //           ':sk': {
  //   //             S: 'songRequest'
  //   //           }
  //   //         }
  //   //       })
  //   //     );

  //   //     console.log(`Items: ${JSON.stringify(Items, null, 2)}`);

  //   //     if (Items?.length != 0) {
  //   //       const songInfoRecord = unmarshall(
  //   //         Items!.filter((item) => {
  //   //           const unmarshalledItem = unmarshall(item);
  //   //           return unmarshalledItem.sk.startsWith('songRequest#yt');
  //   //         })[0]
  //   //       );

  //   //       const song = new Song(
  //   //         songInfoRecord.youtube_id,
  //   //         songInfoRecord.song_title,
  //   //         songInfoRecord.song_length
  //   //       );

  //   //       return song;
  //   //     } else {
  //   //       return undefined;
  //   //     }
  //   //   }

  async save(songId: string, songPlay: SongPlay) {
    console.log(`Saving song play: ${JSON.stringify(songPlay, null, 2)}`);

    const putSongPlayInput: PutItemCommandInput = {
      TableName: table,
      Item: marshall({
        pk: `yt#${songId}`,
        sk: `songPlay#date#${songPlay.date.toISOString()}`,
        requested_by: songPlay.requester,
        request_date: songPlay.date.toISOString(),
        sotn_contender: songPlay.sotnContender,
        sotn_winner: songPlay.sotnWinner,
        sots_winner: songPlay.sotsWinner
      })
    };

    console.log(
      `Inserting song play: ${JSON.stringify(putSongPlayInput, null, 2)}`
    );

    try {
      await dynamoDBClient.send(new PutItemCommand(putSongPlayInput));
      console.log('Song play saved successfully');
    } catch (err) {
      console.error(err);
      throw new Error('Failed to save song play information');
    }
  }

  //   async getAll(songId: string): Promise<SongPlay[]> {
  //     const result = await dynamoDBClient.send(
  //       new QueryCommand({
  //         TableName: table,
  //         ProjectionExpression:
  //           'requested_by,request_date,sotn_contender,sotn_winner,sots_winner',
  //         KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
  //         ExpressionAttributeValues: {
  //           ':pk': {
  //             S: `yt#${songId}`
  //           },
  //           ':sk': {
  //             S: 'songPlay'
  //           }
  //         }
  //       })
  //     );

  //     const { Count, Items } = result;

  //     const plays: SongPlay[] = [];
  //     console.log(`Count: ${Count}`);
  //     if (Items) {
  //       for (const item of Items) {
  //         const play = unmarshall(item);
  //         plays.push(
  //           SongPlay.create({
  //             date: new Date(play.request_date),
  //             requestedBy: play.requested_by,
  //             sotnContender: play.sotn_contender,
  //             sotnWinner: play.sotn_winner,
  //             sotsWinner: play.sots_winner
  //           })
  //         );
  //       }
  //     }

  //     return plays;
  //   }
}
