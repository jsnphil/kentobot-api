import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

import { Construct } from 'constructs';
import { ARCHITECTURE, NODE_RUNTIME } from './CDKConstants';

export interface DataMigrationStackProps extends cdk.StackProps {
  environmentName: string;
}

export class DataMigrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataMigrationStackProps) {
    super(scope, id, props);

    // Import shared resources
    const tableArn = cdk.Fn.importValue(`table-arn-${props.environmentName}`);

    const database = ddb.Table.fromTableAttributes(
      this,
      `stream-data-${props.environmentName}`,
      {
        tableArn: tableArn
      }
    );

    const bucketArn = cdk.Fn.importValue(`bucket-arn-${props.environmentName}`);

    const bucket = s3.Bucket.fromBucketArn(
      this,
      `bucket-${props.environmentName}`,
      bucketArn
    );

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '..', '/resources/'))
      ],
      destinationBucket: bucket,
      destinationKeyPrefix: 'data-migration/song-data'
    });

    const songHistoryMigrationLambda = new lambda.NodejsFunction(
      this,
      `MigrateSongHistory-${props.environmentName}`,
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../src/',
          'data-migration/lambdas/migrate-song-history.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {},
        timeout: cdk.Duration.minutes(10),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3Notifications.LambdaDestination(songHistoryMigrationLambda),

      {
        prefix: 'data-migration/song-data'
      }
    );

    bucket.grantRead(songHistoryMigrationLambda);
  }
}
