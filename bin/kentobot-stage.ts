import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataStack } from '../lib/stacks/data-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { DataMigrationStack } from '../lib/stacks/data-migration-stack';
import { WebSocketStack } from '../lib/stacks/web-socket-stack';

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

    const webSocketStack = new WebSocketStack(this, 'WebSocketStack', props);

    apiStack.addDependency(dataStack);
    dataMigration.addDependency(dataStack);
    dataMigration.addDependency(apiStack);
    webSocketStack.addDependency(dataStack);
    apiStack.addDependency(webSocketStack);

    cdk.Tags.of(this).add('environment', props.environmentName);
    cdk.Tags.of(apiStack).add('system', 'api');
    cdk.Tags.of(dataMigration).add('system', 'data-migration');
  }
}
