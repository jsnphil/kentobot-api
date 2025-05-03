import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Code } from 'better-status-codes';
import crypto from 'crypto';

const TWITCH_SECRET = process.env.TWITCH_SECRET || '';

// Notification request headers
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id';
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp';
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature';
const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type';

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
const MESSAGE_TYPE_NOTIFICATION = 'notification';
const MESSAGE_TYPE_REVOCATION = 'revocation';

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = 'sha256=';

const logger = new Logger();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.logEventIfEnabled(event); //
  try {
    // TODO Put this in an authorizer

    // Validate the request signature
    const messageId = event.headers[TWITCH_MESSAGE_ID];
    const timestamp = event.headers[TWITCH_MESSAGE_TIMESTAMP];
    const signature = event.headers[TWITCH_MESSAGE_SIGNATURE];
    const body = event.body || '';

    const notification = JSON.parse(body);

    if (!messageId || !timestamp || !signature) {
      return {
        statusCode: 400,
        body: 'Missing required headers'
      };
    }

    const secret = getSecret();
    const message = `${messageId}${timestamp}${event.body}`;
    const hmac = HMAC_PREFIX + getHmac(secret, message);

    logger.debug(`Message: ${message}`);
    logger.debug(`Signature: ${signature}`);
    logger.debug(`HMAC Prefix: ${HMAC_PREFIX}`);
    logger.debug(`Secret: ${TWITCH_SECRET}`);
    logger.debug(`HMAC: ${hmac}`);
    logger.debug(`Valid Signature: ${validSignature(hmac, signature)}`);

    if (!validSignature(hmac, signature)) {
      logger.warn(
        `Invalid signature for messageId: ${messageId}, timestamp: ${timestamp}`
      );

      return {
        statusCode: 403,
        body: 'Invalid signature'
      };
    }

    logger.info(`Valid signature for messageId: ${messageId}`);

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

function getSecret() {
  // TODO - Use a secret manager to get the secret
  if (!TWITCH_SECRET) {
    throw new Error('TWITCH_SECRET is not set');
  }
  return TWITCH_SECRET;
}

function getHmac(secret: string, message: string) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

function validSignature(hmac: string, signature: string) {
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}
