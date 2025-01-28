import { Logger } from '@aws-lambda-powertools/logger';
import { SSMClient } from '@aws-sdk/client-ssm';

export class BumpService {
  private readonly logger = new Logger({ serviceName: 'song-bump-service' });

  constructor(apiKey: string) {
    this.logger.info('Initializing bump service');
  }
}
