import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput,
  PostToConnectionRequest
} from '@aws-sdk/client-apigatewaymanagementapi'; // ES Modules import
import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { mockSongQueue } from '../../../mocks/mock-song-queue';

interface MessageBody {
  readonly action: string;
  readonly message: string;
}

console.log(
  `https://${process.env.WEBSOCKET_API_ID}.execute-api.us-east-1.amazonaws.com/${process.env.WEB_SOCKET_STAGE}`
);

const client = new ApiGatewayManagementApiClient({
  endpoint: `https://${process.env.WEBSOCKET_API_ID}.execute-api.us-east-1.amazonaws.com/${process.env.WEB_SOCKET_STAGE}`
});

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  console.log(JSON.stringify(event, null, 2));

  const { routeKey, connectionId } = event.requestContext;

  if (routeKey === '$connect') {
    const putCommand = new PutItemCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Item: {
        pk: { S: 'wsConnection' },
        sk: { S: `connectionId#${connectionId}` },
        connectionId: { S: connectionId }
      }
    });

    await dynamoClient.send(putCommand);

    return {
      statusCode: 200,
      body: 'Welcome to Kentobot'
    };
  }

  if (routeKey === '$disconnect') {
    const deleteCommand = new DeleteItemCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: {
        pk: { S: 'wsConnection' },
        sk: { S: `connectionId#${connectionId}` }
      }
    });

    await dynamoClient.send(deleteCommand);

    return {
      statusCode: 200,
      body: 'Thanks for visiting Kentobot'
    };
  }

  if (routeKey === 'sendmessage') {
    const body: MessageBody = JSON.parse(event.body!);

    const connectionIds = await getConnectionIds();

    if (body.message === 'songqueue') {
      const queue = await getSongQueue();
      console.log(queue);
      for (const connectionId of connectionIds) {
        console.log(`Sending queue to connectionId: ${connectionId}`);

        const input = {
          ConnectionId: connectionId,
          Data: new TextEncoder().encode(JSON.stringify({ songQueue: queue }))
        } as PostToConnectionCommandInput;

        const command = new PostToConnectionCommand(input);

        const response = await client.send(command);

        console.log('Message sent');
        console.log(JSON.stringify(command, null, 2));
      }
    }
  }

  return {
    statusCode: 200,
    body: 'Message sent'
  };
};

const getConnectionIds = async () => {
  console.log('Getting connectionIds');
  const queryCommand = new QueryCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: 'wsConnection' },
      ':sk': { S: 'connectionId' }
    }
  });

  const { Items } = await dynamoClient.send(queryCommand);

  const connectionIds: string[] = [];
  if (Items) {
    for (const item of Items) {
      connectionIds.push(item.connectionId.S!);
    }
  }

  console.log(`ConnectionIds: ${connectionIds}`);
  return connectionIds;
};

const getSongQueue = async () => {
  return mockSongQueue;
};

// const getSongQueue = async () => {
//   const queryCommand = new QueryCommand({
//     TableName: process.env.CONNECTIONS_TABLE,
//     KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
//     ExpressionAttributeValues: {
//       ':pk': { S: 'songList' },
//       ':sk': { S: 'queue' }
//     }
//   });

//   const { Items } = await dynamoClient.send(queryCommand);

//   let queue;
//   for (const item of Items!) {
//     queue = unmarshall(item);
//   }

//   return queue;
// };
