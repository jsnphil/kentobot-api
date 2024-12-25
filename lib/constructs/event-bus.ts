import * as events from 'aws-cdk-lib/aws-events';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';

import { Construct } from 'constructs';

export interface EventBusProps {
  readonly environmentName: string;
}

export interface TargetProps {
  readonly source: string;
  readonly eventPattern: events.EventPattern;
}

export interface QueueTargetProps extends TargetProps {
  readonly queue: sqs.Queue;
}

export class EventBus extends Construct {
  public readonly bus: events.IEventBus;

  constructor(scope: Construct, id: string, props: EventBusProps) {
    super(scope, id);

    // Create the event bus
    this.bus = new events.EventBus(scope, 'kentobot-event-bus', {
      eventBusName: `Kentobot-EventBus-${props.environmentName}`
    });

    this.bus.archive('kentobot-event-archive', {
      archiveName: `KentobotEventArchive-${props.environmentName}`,
      eventPattern: {
        account: [cdk.Stack.of(scope).account]
      },
      retention: cdk.Duration.days(365)
    });

    new events.Rule(scope, `kentobot-event-logger-rule`, {
      description: 'Log all events',
      eventPattern: {
        region: ['us-east-1']
      },
      eventBus: this.bus
    });
  }

  public addQueueTarget(scope: Construct, id: string, props: QueueTargetProps) {
    const rule = new events.Rule(scope, id, {
      eventBus: this.bus,
      eventPattern: {
        source: [props.source],
        ...props.eventPattern
      }
    });

    rule.addTarget(new eventsTargets.SqsQueue(props.queue));
  }
}
