import { Logger } from '@aws-lambda-powertools/logger';
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput
} from '@aws-sdk/client-eventbridge';

export class EventPublisher {
  private static eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION
  });

  static logger = new Logger({ serviceName: 'event-publisher' });

  public static async publish(events: KentobotDomainEvent[]) {
    this.logger.debug('Publishing event:', event);

    if (!events || events.length === 0) {
      this.logger.debug('No events to publish');
      return;
    }

    const params: PutEventsCommandInput = {
      Entries: events.map((event) => ({
        Source: event.source,
        DetailType: event.type,
        Detail: JSON.stringify(event.toJSON()),
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
