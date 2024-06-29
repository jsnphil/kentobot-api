import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  Table,
  BillingMode,
  AttributeType,
  StreamViewType
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface StreamDataProps extends StackProps {
  readonly environment: string;
}

export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props: StreamDataProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const streamDataTable = new Table(
      this,
      `KBStreamData-${props.environment}`,
      {
        tableName: `KB-Stream-Data-${props.environment}`,
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: 'pk',
          type: AttributeType.STRING
        },
        pointInTimeRecovery: true,
        sortKey: {
          name: 'sk',
          type: AttributeType.STRING
        },
        stream: StreamViewType.NEW_IMAGE
      }
    );
    // Create GSI 1
    // Create GSI 2

    // Export Table ARN
    new CfnOutput(this, `KBData-TableArnExport-${props.environment}`, {
      value: streamDataTable.tableArn,
      description: 'The name of the table',
      exportName: `kb-data-table-arn-${props.environment}`
    });
    // Create S3 Bucket
    // Export Bucket Name
  }
}
