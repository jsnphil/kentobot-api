import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { DataStack } from './data-stack';

export interface KentobotProps extends cdk.StageProps {
  readonly environmentName: string;
}

export class KentobotStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: KentobotProps) {
    super(scope, id, props);

    // Add both stacks to the stage
    new ApiStack(this, 'AppStack', props);
    new DataStack(this, 'DatabaseStack', props);
  }
}
