import {
  EventBridgeClient,
  PutEventsCommand
} from '@aws-sdk/client-eventbridge';
import { KentobotDomainEvent } from '@core/events/domain-event';
import { mockClient } from 'aws-sdk-client-mock';
import { EventPublisher } from './event-publisher';

const mockEventBridgeClient = mockClient(EventBridgeClient);

describe('EventPublisher', () => {
  describe('publish', () => {
    it('should log and return if no events are provided', async () => {
      const loggerSpy = jest.spyOn(EventPublisher.logger, 'debug');
      await EventPublisher.publish([]);
      expect(loggerSpy).toHaveBeenCalledWith('No events to publish');
    });

    it('should publish events to EventBridge', async () => {
      const mockEvent: KentobotDomainEvent<any> = {
        type: 'test.type',
        occurredAt: new Date().toISOString(),
        source: 'test.source',
        version: 1,
        payload: { key: 'value' }
      };

      const loggerSpy = jest.spyOn(EventPublisher.logger, 'debug');

      mockEventBridgeClient.on(PutEventsCommand).resolves({
        FailedEntryCount: 0,
        Entries: []
      });

      await EventPublisher.publish([mockEvent]);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Publishing event:',
        JSON.stringify([mockEvent])
      );
    });
  });
});
