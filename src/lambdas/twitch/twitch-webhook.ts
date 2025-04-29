import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';
import crypto from 'crypto';

const TWITCH_SECRET = process.env.TWITCH_SECRET || '';

// Notification request headers
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  'Twitch-Eventsub-Message-Signature'.toLowerCase();
const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
const MESSAGE_TYPE_NOTIFICATION = 'notification';
const MESSAGE_TYPE_REVOCATION = 'revocation';

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = 'sha256=';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Validate the request signature
    const messageId = event.headers[TWITCH_MESSAGE_ID]?.toLowerCase();
    const timestamp = event.headers[TWITCH_MESSAGE_TIMESTAMP]?.toLowerCase();
    const signature = event.headers[TWITCH_MESSAGE_SIGNATURE]?.toLowerCase();
    const body = event.body || '';

    const notification = JSON.parse(body);

    if (!messageId || !timestamp || !signature) {
      return {
        statusCode: 400,
        body: 'Missing required headers'
      };
    }

    const message = `${messageId}${timestamp}${body}`;
    const hmac = crypto
      .createHmac('sha256', TWITCH_SECRET)
      .update(message)
      .digest('hex');
    const expectedSignature = `sha256=${hmac}`;

    if (signature !== expectedSignature) {
      return {
        statusCode: 403,
        body: 'Invalid signature'
      };
    }

    // Handle the event
    const parsedBody = JSON.parse(body);

    if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_VERIFICATION) {
      // Respond to the verification challenge
      return {
        statusCode: Code.OK,
        body: notification.challenge,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    } else if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_REVOCATION) {
      // Handle revocation event
      console.log('Revocation event:', parsedBody);

      console.log(`${notification.subscription.type} notifications revoked!`);
      console.log(`reason: ${notification.subscription.status}`);
      console.log(
        `condition: ${JSON.stringify(
          notification.subscription.condition,
          null,
          4
        )}`
      );

      return {
        statusCode: Code.NO_CONTENT,
        body: parsedBody.challenge,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    } else if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_NOTIFICATION) {
      // TODO Handle event

      // Handle notification event
      console.log('Notification event:', notification);

      return {
        statusCode: Code.NO_CONTENT,
        body: ''
      };
    } else {
      return {
        statusCode: Code.NO_CONTENT,
        body: ''
      };
    }
  } catch (error) {
    console.error('Error handling Twitch webhook:', error);

    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
