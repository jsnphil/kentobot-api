import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { WebSocketConnectionsRepository } from '../../repositories/websocket-connections-repository';
import { handleRoute } from './message-handler';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  PostToConnectionCommandInput
} from '@aws-sdk/client-apigatewaymanagementapi';
import { mockClient } from 'aws-sdk-client-mock';

const mockDynamoDBClient = mockClient(DynamoDBClient);
// const mockApiClient = mockClient(ApiGatewayManagementApiClient);

describe('message-handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('handleRoute', () => {
    it('should save connection when routeKey is $connect', async () => {
      // Arrange
      const routeKey = '$connect';
      const connectionId = '123';
      const body = undefined;

      mockDynamoDBClient.on(PutItemCommand).resolves({});

      const saveConnection = jest.spyOn(
        WebSocketConnectionsRepository.prototype,
        'saveConnection'
      );

      // Act
      await handleRoute(routeKey, connectionId, body);

      // Assert
      expect(saveConnection).toHaveBeenCalledWith(connectionId);
    });

    it('should delete connection when routeKey is $disconnect', async () => {
      // Arrange
      const routeKey = '$disconnect';
      const connectionId = '123';
      const body = undefined;

      mockDynamoDBClient.on(DeleteItemCommand).resolves({});

      const deleteConnection = jest.spyOn(
        WebSocketConnectionsRepository.prototype,
        'deleteConnection'
      );

      // Act
      await handleRoute(routeKey, connectionId, body);

      // Assert
      expect(deleteConnection).toHaveBeenCalledWith(connectionId);
    });
  });

  //   describe('sendMessage', () => {
  //     it('should send a pong for a ping', async () => {
  //         // Arrange
  //         const connectionId = '123';
  //         const message = 'ping';

  //         const postToConnection = jest.fn();

  //         const mockClient = mockClient(ApiGatewayManagementApiClient);
  //         mockClient.on(PostToConnectionCommand).resolves({});

  //         // Act
  //         await sendMessage(connectionId, message);

  //         // Assert
  //         expect(postToConnection).toHaveBeenCalledWith({
  //             ConnectionId: connectionId,
  //             Data: JSON.stringify({ action: 'pong' })
  //     });
  //   });
});
