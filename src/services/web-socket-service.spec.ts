import { Logger } from '@aws-lambda-powertools/logger';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from '@aws-sdk/client-apigatewaymanagementapi';
import { mockClient } from 'aws-sdk-client-mock';
import { WebSocketService } from './web-socket-service';

const mockApiGatewayClient = mockClient(ApiGatewayManagementApiClient);
let service: WebSocketService;

describe('web-socket-service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    service = new WebSocketService();
  });

  describe('sendToConnection', () => {
    it('should send the message to the connection', async () => {
      // Arrange
      const connectionId = '123';
      const message = 'Hello, world!';

      mockApiGatewayClient.on(PostToConnectionCommand).resolves({});

      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      // Act
      await service.sendToConnection(connectionId, message);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('Sent message to connection: 123');
    });

    it('should throw an error if the message fails to send', async () => {
      // Arrange
      const connectionId = '123';
      const message = 'Hello, world!';

      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      mockApiGatewayClient
        .on(PostToConnectionCommand)
        .rejects('Failed to send message');

      await service.sendToConnection(connectionId, message);

      expect(loggerSpy).toHaveBeenLastCalledWith(
        'Failed to send message to connection: 123'
      );
    });
  });
});
