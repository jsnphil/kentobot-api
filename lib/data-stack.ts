import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface StreamDataProps extends StackProps {
  readonly environment: string;
}

export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props?: StreamDataProps) {
    super(scope, id, props);

    // Create DynamoDB table
    // Create GSI 1
    // Create GSI 2

    // Export Table ARN
    // Create S3 Bucket
    // Export Bucket Name
  }
}
