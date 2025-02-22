import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { ARCHITECTURE, lambdaEnvironment, NODE_RUNTIME } from '../CDKConstants';

import path = require('path');

interface WSSBroadcastRestEndpointProps {
  readonly id: string;

  readonly environmentName: string;
  readonly apiProps: {
    readonly parentResource: apiGateway.Resource;
    readonly resourcePath: string;
    readonly resourceMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
    readonly requireApiKey?: boolean;
  };
  readonly lambdaProps: {
    readonly source: string;
    readonly environmentVaribles?: { [key: string]: string };
    readonly timeout?: cdk.Duration;
    readonly memorySize?: number;
    readonly databaseName: string;
    readonly allowDatabaseWrite?: boolean;
  };
  readonly webSocketProps: {
    readonly webSocketApiId: string;
    readonly webSocketApiStage: string;
  };

  //   readonly env: cdk.Environment;
}

export class WSSBroadcastRestEndpoint extends Construct {
  apiResource: apiGateway.Resource;
  restEndpointLambda;

  constructor(
    scope: cdk.Stack,
    id: string,
    props: WSSBroadcastRestEndpointProps
  ) {
    super(scope, id);

    const { parentResource, resourcePath, resourceMethod, requireApiKey } =
      props.apiProps;
    const {
      source,
      environmentVaribles,
      timeout,
      memorySize,
      databaseName,
      allowDatabaseWrite
    } = props.lambdaProps;
    const { webSocketApiId, webSocketApiStage } = props.webSocketProps;

    this.apiResource = parentResource.addResource(resourcePath);

    this.restEndpointLambda = new lambda.NodejsFunction(scope, props.id, {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../', 'src/lambdas/rest-api/', source),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ...environmentVaribles,
        ENVIRONMENT: props.environmentName,
        STREAM_DATA_TABLE: databaseName,
        WEBSOCKET_API_ID: webSocketApiId,
        WEB_SOCKET_STAGE: webSocketApiStage
      },
      timeout: timeout ?? cdk.Duration.seconds(15),
      architecture: ARCHITECTURE,
      memorySize: memorySize ?? 256
    });

    this.apiResource.addMethod(
      resourceMethod,
      new apiGateway.LambdaIntegration(this.restEndpointLambda),
      { apiKeyRequired: requireApiKey }
    );

    const ddbArn = cdk.Stack.of(scope).formatArn({
      service: 'dynamodb',
      resource: 'table',
      resourceName: databaseName
    });

    this.restEndpointLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:GetItem'],
        resources: [
          // `arn:aws:dynamodb:${props.env.region}:${props.env.account}:table/${databaseName}`
          ddbArn
        ]
      })
    );

    if (allowDatabaseWrite) {
      this.restEndpointLambda.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['dynamodb:PutItem'],
          resources: [
            // `arn:aws:dynamodb:${props.env.region}:${props.env.account}:table/${databaseName}`
            ddbArn
          ]
        })
      );
    }

    const webSocketApiArn = cdk.Stack.of(scope).formatArn({
      service: 'execute-api',
      resource: webSocketApiId
    });

    this.restEndpointLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['execute-api:ManageConnections'],
        resources: [
          //   `arn:aws:execute-api:${props.env?.region}:${props.env?.account}:${webSocketApiId}/*/*/@connections/*`
          webSocketApiArn
        ]
      })
    );
  }
}
