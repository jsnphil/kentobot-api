import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';

export const NODE_RUNTIME = Runtime.NODEJS_22_X;
export const ARCHITECTURE = Architecture.ARM_64;

export const lambdaEnvironment = {
  POWERTOOLS_LOG_LEVEL: 'DEBUG',
  AWS_RETRY_MODE: 'standard',
  AWS_MAX_ATTEMPTS: '5',
  POWERTOOLS_LOGGER_LOG_EVENT: 'true'
};
