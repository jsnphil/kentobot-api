import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { ApiStackProps } from '../api-stack';

export interface ApiProps extends ApiStackProps {}

export class Api extends Construct {
  readonly apiGateway: apiGateway.RestApi;
  private environmentName: string;
  private usagePlan: apiGateway.UsagePlan;
  readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    this.environmentName = props.environmentName;

    const api = new apiGateway.RestApi(this, `Kentobot-API`, {
      restApiName: `KentobotAPI-${props.environmentName}`,
      description: `Kentobot API for ${props.environmentName}`,
      deployOptions: {
        stageName: props.environmentName,
        loggingLevel: apiGateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      }
    });

    this.usagePlan = api.addUsagePlan('usage-plans', {
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });

    this.usagePlan.addApiStage({
      stage: api.deploymentStage
    });

    this.role = new iam.Role(this, `api-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });

    this.apiGateway = api;
  }

  public createApiKey(clientName: string) {
    const apiKey = new apiGateway.ApiKey(this, `ApiKey-${clientName}`, {
      apiKeyName: `${clientName} (${this.environmentName})`,
      description: `API Key for ${clientName} (${this.environmentName})`
    });

    this.usagePlan.addApiKey(apiKey);
  }
}
