/* eslint-disable no-console */
import { Logger } from '@aws-lambda-powertools/logger';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Attribute } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';

const logger = new Logger({ serviceName: 'event-publisher' });

const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION
});

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  logger.logEventIfEnabled(event);

  for (const record of event.Records) {
    const image = record.dynamodb?.NewImage;

    if (image) {
      const event = unmarshall(image as Record<string, AttributeValue>);

      // Publish the event to EventBridge
    }

    // // Handle new item inserted
    // const newItem = record.dynamodb?.NewImage;
    // // Handle item modified
    // const updatedItem = record.dynamodb?.NewImage;
    // // Handle item removed
    // const removedItem = record.dynamodb?.OldImage;
    // console.log('Item removed:', removedItem);
  }
};
