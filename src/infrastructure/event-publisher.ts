import { Logger } from '@aws-lambda-powertools/logger';
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput
} from '@aws-sdk/client-eventbridge';
import { KentobotDomainEvent } from '@core/events/domain-event';

export class EventPublisher {
  private static eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION
  });

  static logger = new Logger({ serviceName: 'event-publisher' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async publish(events: KentobotDomainEvent<any>[]) {
    this.logger.debug('Publishing event:', JSON.stringify(events));

    if (!events || events.length === 0) {
      this.logger.debug('No events to publish');
      return;
    }

    const params: PutEventsCommandInput = {
      Entries: events.map((event) => ({
        Source: event.source,
        DetailType: event.type,
        Detail: JSON.stringify(event.payload),
        EventBusName: process.env.EVENT_BUS_NAME
      }))
    };

    this.logger.debug(`Event parameters: ${JSON.stringify(params)}`);
    const data = await this.eventBridgeClient.send(
      new PutEventsCommand(params)
    );

    this.logger.debug(`Event published: ${JSON.stringify(data)}`);
  }
}
