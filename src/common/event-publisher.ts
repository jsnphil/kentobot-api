import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput
} from '@aws-sdk/client-eventbridge';

export class EventPublisher {
  private static eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION
  });

  public static async publishEvent(event: any, eventType: string) {
    console.log('Publishing event:', event);

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

    console.log('Publishing event:', params);

    const data = await this.eventBridgeClient.send(
      new PutEventsCommand(params)
    );
    console.log('Event published:', data);
  }
}
