import { Logger } from '@aws-lambda-powertools/logger';
import { TwitchEventNotification } from '../../types/twitch';
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

const logger = new Logger({ serviceName: 'twitch-event-webhook' });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.logEventIfEnabled(event);

  try {
    if (!validRequest(event.headers, event.body)) {
      return {
        statusCode: 403,
        body: 'Invalid request'
      };
    }

    const notification = JSON.parse(event.body!) as TwitchEventNotification;

    if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_VERIFICATION) {
      return {
        statusCode: Code.OK,
        body: notification!.challenge,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    } else if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_REVOCATION) {
      logger.debug(`${notification.subscription.type} notifications revoked!`);
      logger.debug(`Revocation reason: ${notification.subscription.status}`);

      return {
        statusCode: Code.NO_CONTENT,
        body: notification.challenge,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    } else if (event.headers[MESSAGE_TYPE] === MESSAGE_TYPE_NOTIFICATION) {
      logger.debug(`Notification event: ${JSON.stringify(notification)}`);

      const domainEvent = TwitchEventMapper.toDomainEvent(notification);
      logger.debug(`Domain event: ${JSON.stringify(domainEvent)}`);
      if (domainEvent) {
        await EventPublisher.publishEvent([domainEvent]);
      }

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
    logger.error(`Error handling Twitch webhook: ${error}`);

    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};

function validRequest(
  headers: Record<string, string | undefined>,
  body: string | null
): boolean {
  if (!headers || !body) {
    return false;
  }

  const messageId = headers[TWITCH_MESSAGE_ID];
  const timestamp = headers[TWITCH_MESSAGE_TIMESTAMP];
  const signature = headers[TWITCH_MESSAGE_SIGNATURE];

  if (!messageId || !timestamp || !signature) {
    return false;
  }

  const secret = getSecret();
  const message = `${messageId}${timestamp}${body}`;
  const hmac = HMAC_PREFIX + getHmac(secret, message);

  if (validSignature(hmac, signature)) {
    logger.debug('Valid signature');
    return true;
  } else {
    logger.warn(
      `Invalid signature for messageId: ${messageId}, timestamp: ${timestamp}`
    );
    return false;
  }
}

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
