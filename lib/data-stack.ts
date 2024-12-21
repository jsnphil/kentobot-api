import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';

export interface DataStackProps extends cdk.StackProps {
  environmentName: string;
}

export class DataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const streamDataTable = new ddb.Table(
      this,
      `stream-data-${props.environmentName}`,
      {
        tableName: `stream-data-${props.environmentName}`,
        billingMode: ddb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: 'pk',
          type: ddb.AttributeType.STRING
        },
        pointInTimeRecovery: true,
        sortKey: {
          name: 'sk',
          type: ddb.AttributeType.STRING
        },
        stream: ddb.StreamViewType.NEW_IMAGE
      }
    );

    streamDataTable.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: {
        name: 'gsi_pk1',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'gsi_sk1',
        type: ddb.AttributeType.STRING
      },
      projectionType: ddb.ProjectionType.ALL
    });

    streamDataTable.addGlobalSecondaryIndex({
      indexName: 'gsi2',
      partitionKey: {
        name: 'gsi_pk2',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'gsi_sk2',
        type: ddb.AttributeType.STRING
      },
      projectionType: ddb.ProjectionType.ALL
    });

    new cdk.CfnOutput(this, `TableArnExport-${props.environmentName}`, {
      value: streamDataTable.tableArn,
      description: 'The name of the table',
      exportName: `table-arn-${props.environmentName}`
    });

    const dataBucket = new s3.Bucket(
      this,
      `StreamDataBucket-${props.environmentName}`,
      {
        bucketName: `stream-data-${props.environmentName}`,
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY
      }
    );

    new cdk.CfnOutput(this, `BucketArnExport-${props.environmentName}`, {
      value: dataBucket.bucketArn,
      description: 'The ARN of the data bucket',
      exportName: `bucket-arn-${props.environmentName}`
    });
  }
}
