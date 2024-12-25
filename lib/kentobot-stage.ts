import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { DataStack } from './data-stack';
import { DataMigrationStack } from './data-migration';

export interface KentobotProps extends cdk.StageProps {
  readonly environmentName: string;
}

export class KentobotStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: KentobotProps) {
    super(scope, id, props);

    // Add both stacks to the stage
    const dataStack = new DataStack(this, 'DatabaseStack', props);
    const apiStack = new ApiStack(this, 'ApiStack', props);
    const dataMigration = new DataMigrationStack(
      this,
      'DataMigrationStack',
      props
    );

    apiStack.addDependency(dataStack);
    dataMigration.addDependency(dataStack);
    dataMigration.addDependency(apiStack);

    cdk.Tags.of(this).add('environment', props.environmentName);
    cdk.Tags.of(apiStack).add('system', 'api');
    cdk.Tags.of(dataMigration).add('system', 'data-migration');
  }
}
