import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Construct } from 'constructs';
import { createSongRequestParameters } from './song-request-parameters';
import { ARCHITECTURE, NODE_RUNTIME } from './CDKConstants';
import path = require('path');

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

    const {
      publicVideoToggle,
      requestDurationLimit,
      djRequestDurationLimit,
      licensedContentToggle
    } = createSongRequestParameters(this, props.environmentName);

    const requestSongResource = songRequestEndpointResource
      .addResource('request')
      .addResource('{songId}');

    const apiKeyParameter =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'ApiKeyParameter',
        {
          parameterName: 'youtube-api-key'
        }
      );

    const songRequestLambda = new lambda.NodejsFunction(
      this,
      `RequestSong-${props.environmentName}`,
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../src/api/',
          'song-request/lambdas/request-song.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          ENVIRONMENT: props.environmentName,
          PUBLIC_VIDEO_TOGGLE_NAME: publicVideoToggle.parameterName,
          REQUEST_DURATION_NAME: requestDurationLimit.parameterName,
          DJ_HOUR_REQUEST_DURATION_NAME: djRequestDurationLimit.parameterName,
          LICENSED_VIDEO_TOGGLE_NAME: licensedContentToggle.parameterName
          // STREAM_DATA_TABLE: this.database.tableName
        },
        timeout: cdk.Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    publicVideoToggle.grantRead(songRequestLambda);
    requestDurationLimit.grantRead(songRequestLambda);
    djRequestDurationLimit.grantRead(songRequestLambda);
    licensedContentToggle.grantRead(songRequestLambda);
    apiKeyParameter.grantRead(songRequestLambda);

    requestSongResource.addMethod(
      'GET',
      new apiGateway.LambdaIntegration(songRequestLambda)
    );
  }
}
