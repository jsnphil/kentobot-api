import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  Table,
  BillingMode,
  AttributeType,
  StreamViewType,
  ProjectionType
} from 'aws-cdk-lib/aws-dynamodb';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface StreamDataProps extends StackProps {
  readonly environment: string;
}

export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props: StreamDataProps) {
    super(scope, id, props);

    const streamDataTable = new Table(this, `StreamData-${props.environment}`, {
      tableName: `Stream-Data-${props.environment}`,
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
    });

    streamDataTable.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: {
        name: 'gsi_pk1',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'gsi_sk1',
        type: AttributeType.STRING
      },
      projectionType: ProjectionType.ALL
    });

    streamDataTable.addGlobalSecondaryIndex({
      indexName: 'gsi2',
      partitionKey: {
        name: 'gsi_pk2',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'gsi_sk2',
        type: AttributeType.STRING
      },
      projectionType: ProjectionType.ALL
    });

    new CfnOutput(this, `TableArnExport-${props.environment}`, {
      value: streamDataTable.tableArn,
      description: 'The name of the table',
      exportName: `kb-db-table-arn-${props.environment}`
    });

    const dataBucket = new Bucket(
      this,
      `StreamDataBucket-${props.environment}`,
      {
        bucketName: `stream-data-${props.environment}`,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY
      }
    );

    new CfnOutput(this, `StreamDataBucketNameExport-${props.environment}`, {
      value: dataBucket.bucketName,
      description: 'The name of the stream data bucket',
      exportName: `kb-stream-data-bucket-name-${props.environment}`
    });
  }
}
