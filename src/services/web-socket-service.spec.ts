import { Logger } from '@aws-lambda-powertools/logger';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from '@aws-sdk/client-apigatewaymanagementapi';
import { mockClient } from 'aws-sdk-client-mock';
import { WebSocketService } from './web-socket-service';
import { WebSocketConnectionsRepository } from '@repositories/websocket-connections-repository';
import { connect } from 'http2';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApiGatewayClient = mockClient(ApiGatewayManagementApiClient);
let service: WebSocketService;

describe('web-socket-service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service = new WebSocketService();
  });

  describe('sendToConnection', () => {
    it('should send the message to the connection', async () => {
      // Arrange
      const connectionId = '123';
      const message = 'Hello, world!';

      mockApiGatewayClient.on(PostToConnectionCommand).resolves({});

      const loggerSpy = vi.spyOn(Logger.prototype, 'debug');

      // Act
      await service.sendToConnection(connectionId, message);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('Sent message to connection: 123');
    });

    it('should throw an error if the message fails to send', async () => {
      // Arrange
      const connectionId = '123';
      const message = 'Hello, world!';

      const loggerSpy = vi.spyOn(Logger.prototype, 'warn');

      mockApiGatewayClient
        .on(PostToConnectionCommand)
        .rejects('Failed to send message');

      await service.sendToConnection(connectionId, message);

      expect(loggerSpy).toHaveBeenLastCalledWith(
        'Failed to send message to connection: 123'
      );
    });
  });

  describe('broadcast', () => {
    it('should send the message to all connections', async () => {
      // Arrange
      const connections = [
        { connectionId: '123', connectedAt: '2021-10-01T00:00:00Z' },
        { connectionId: '456', connectedAt: '2021-10-01T00:00:00Z' },
        { connectionId: '789', connectedAt: '2021-10-01T00:00:00Z' }
      ];

      vi.spyOn(
        WebSocketConnectionsRepository.prototype,
        'getAllConnections'
      ).mockResolvedValue(connections);
      const loggerSpy = vi.spyOn(Logger.prototype, 'debug');
      const sendToConnectionSpy = vi.spyOn(service, 'sendToConnection');

      vi.spyOn(service, 'sendToConnection').mockResolvedValue();

      // Act
      await service.broadcast('Hello, world!');

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Broadcasting message [Hello, world!] to 3 connections'
      );
      expect(sendToConnectionSpy).toHaveBeenCalledTimes(3);
    });
  });
});
