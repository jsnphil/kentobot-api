import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  environmentName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new apiGateway.RestApi(
      this,
      `KentobotAPI-${props.environmentName}`,
      {
        restApiName: `KentobotAPI-${props.environmentName}`,
        description: `Kentobot API for ${props.environmentName}`,
        deployOptions: {
          stageName: props.environmentName,
          loggingLevel: apiGateway.MethodLoggingLevel.INFO,
          dataTraceEnabled: true
        }
      }
    );

    const songRequestEndpointResource = api.root.addResource('song-requests');
    songRequestEndpointResource.addMethod(
      'GET',
      new apiGateway.MockIntegration()
    );
  }
}
