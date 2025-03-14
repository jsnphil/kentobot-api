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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async publishEvent(event: any, eventType: string) {
    this.logger.debug('Publishing event:', event);

    const params: PutEventsCommandInput = {
      Entries: [
        {
          Source: 'kentobot.streaming.system',
          DetailType: eventType,
          Detail: JSON.stringify(event.toJSON()),
          EventBusName: process.env.EVENT_BUS_NAME
        }
      ]
    };

    const data = await this.eventBridgeClient.send(
      new PutEventsCommand(params)
    );

    this.logger.debug(`Event published: ${data}`);
  }
}
