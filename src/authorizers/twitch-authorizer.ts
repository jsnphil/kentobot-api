import { Logger } from '@aws-lambda-powertools/logger';
import {
  APIGatewayAuthorizerResult,
  APIGatewayProxyWithLambdaAuthorizerEvent
} from 'aws-lambda';
import crypto from 'crypto';

const logger = new Logger({ serviceName: 'twitch-authorizer' });

const TWITCH_SECRET = process.env.TWITCH_SECRET || '';

// Notification request headers
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  'Twitch-Eventsub-Message-Signature'.toLowerCase();

const HMAC_PREFIX = 'sha256=';

export const handler = async (
  event: APIGatewayProxyWithLambdaAuthorizerEvent<any>
): Promise<APIGatewayAuthorizerResult> => {
  logger.logEventIfEnabled(event);

  const messageId = event.headers[TWITCH_MESSAGE_ID];
  const timestamp = event.headers[TWITCH_MESSAGE_TIMESTAMP];
  const signature = event.headers[TWITCH_MESSAGE_SIGNATURE];

  if (!messageId || !timestamp || !signature) {
    throw new Error('Unauthorized: Missing required headers');
  }

  const secret = getSecret();
  const message = `${messageId}${timestamp}${event.body}`;
  const hmac = HMAC_PREFIX + getHmac(secret, message);

  if (validSignature(hmac, signature)) {
    logger.debug('Valid signature');
    return generatePolicy('user', 'Allow', event.methodArn);
  } else {
    logger.warn(
      `Invalid signature for messageId: ${messageId}, timestamp: ${timestamp}`
    );

    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

const generatePolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult => {
  const policy: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };
  return policy;
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
