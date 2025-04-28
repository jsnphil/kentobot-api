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

    const { streamDataTable } = this.createStreamDataTable(
      this,
      props.environmentName
    );

    const { songHistoryTable } = this.createSongHistoryTable(
      this,
      props.environmentName
    );

    new cdk.CfnOutput(this, `StreamTableArnExport`, {
      value: streamDataTable.tableArn,
      description: 'The name of the table',
      exportName: `stream-data-table-arn-${props.environmentName}`
    });

    new cdk.CfnOutput(this, `StreamArnExport`, {
      value: streamDataTable.tableStreamArn!,
      description: 'The ARN of the stream data table stream',
      exportName: `stream-data-table-stream-arn-${props.environmentName}`
    });

    new cdk.CfnOutput(this, `SongHistoryTableArnExport`, {
      value: songHistoryTable.tableArn,
      description: 'The name of the song history table',
      exportName: `song-history-table-arn-${props.environmentName}`
    });

    const dataBucket = new s3.Bucket(this, 'StreamDataBucket', {
      bucketName: `stream-data-${props.environmentName}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    new cdk.CfnOutput(this, 'BucketArnExport', {
      value: dataBucket.bucketArn,
      description: 'The ARN of the data bucket',
      exportName: `bucket-arn-${props.environmentName}`
    });
  }

  createStreamDataTable(scope: Construct, environmentName: string) {
    const streamDataTable = new ddb.Table(this, `stream-data`, {
      tableName: `stream-data-${environmentName}`,
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
      stream: ddb.StreamViewType.NEW_IMAGE,
      deletionProtection: environmentName === 'prod' || false,
      timeToLiveAttribute: 'ttl'
    });

    return { streamDataTable };
  }

  createSongHistoryTable(scope: Construct, environmentName: string) {
    const songHistoryTable = new ddb.Table(this, `song-history`, {
      tableName: `song-history-${environmentName}`,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'pk',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: ddb.AttributeType.STRING
      },
      pointInTimeRecovery: true,
      deletionProtection: environmentName === 'prod' || false
    });

    songHistoryTable.addGlobalSecondaryIndex({
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

    return { songHistoryTable };
  }
}
