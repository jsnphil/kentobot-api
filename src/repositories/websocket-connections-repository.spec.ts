import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand
} from '@aws-sdk/client-dynamodb';
import { WebSocketConnectionsRepository } from './websocket-connections-repository';
import { mockClient } from 'aws-sdk-client-mock';
import { Logger } from '@aws-lambda-powertools/logger';

describe('WebsocketConnectionsRepository', () => {
  const mockDynamoDBClient = mockClient(DynamoDBClient);

  let repository: WebSocketConnectionsRepository;
  beforeEach(() => {
    repository = new WebSocketConnectionsRepository();
    jest.clearAllMocks();
  });

  describe('saveConnection', () => {
    it('should save a connection', async () => {
      // Arrange
      mockDynamoDBClient.on(PutItemCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      // Act
      await repository.saveConnection('connectionId');

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Saved connection: {"$metadata":{"httpStatusCode":200}}'
      );
    });

    it('should throw an error if the connection cannot be saved', async () => {
      // Arrange
      mockDynamoDBClient
        .on(PutItemCommand)
        .rejects(new Error('Failed to save connection'));

      expect(() => repository.saveConnection('connectionId')).rejects.toThrow(
        'Failed to save connection'
      );
    });
  });

  describe('deleteConnection', () => {
    it('should delete a connection', async () => {
      // Arrange
      mockDynamoDBClient.on(DeleteItemCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });
      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      // Act
      await repository.deleteConnection('connectionId');

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Deleted connection: {"$metadata":{"httpStatusCode":200}}'
      );
    });

    it('should throw an error if the connection cannot be deleted', async () => {
      // Arrange
      mockDynamoDBClient
        .on(DeleteItemCommand)
        .rejects(new Error('Failed to save connection'));

      expect(() => repository.deleteConnection('connectionId')).rejects.toThrow(
        'Failed to delete connection'
      );
    });
  });

  describe('getAllConnections', () => {
    it('should get all connection IDs', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          {
            pk: { S: 'wsConnection' },
            sk: { S: 'connectionId#connectionId1' },
            connectionId: { S: 'connectionId1' },
            connectedAt: { S: new Date().toISOString() },
            ttl: { N: '123456' }
          },
          {
            pk: { S: 'wsConnection' },
            sk: { S: 'connectionId#connectionId2' },
            connectionId: { S: 'connectionId2' },
            connectedAt: { S: new Date().toISOString() },
            ttl: { N: '123456' }
          },
          {
            pk: { S: 'wsConnection' },
            sk: { S: 'connectionId#connectionId3' },
            connectionId: { S: 'connectionId3' },
            connectedAt: { S: new Date().toISOString() },
            ttl: { N: '123456' }
          },
          {
            pk: { S: 'wsConnection' },
            sk: { S: 'connectionId#connectionId4' },
            connectionId: { S: 'connectionId4' },
            connectedAt: { S: new Date().toISOString() },
            ttl: { N: '123456' }
          }
        ]
      });

      const connections = await repository.getAllConnections();
      expect(connections).toBeDefined();
      expect(connections.length).toBe(4);
    });

    it('should return an empty list if there are no connections', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

      const connections = await repository.getAllConnections();
      expect(connections).toBeDefined();
      expect(connections.length).toBe(0);
    });
  });
});
