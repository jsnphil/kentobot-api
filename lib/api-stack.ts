import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  RestApi,
  LogGroupLogDestination,
  AccessLogFormat,
  ApiKeySourceType,
  Cors,
  ApiKey,
  LambdaIntegration
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import path = require('path');
import { env } from 'process';
import { ARCHITECTURE, NODE_RUNTIME } from './CDKConstants';
import { createSongRequestParameters } from './song-request-parameters';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ApiStackProps extends StackProps {
  readonly environment: string;
}

export class ApiStack extends Stack {
  readonly environmentName: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.environmentName = props.environment;

    /** Create the API */
    const { api } = this.createApi();

    api.root.addMethod('ANY');
    this.createSongRequestAPIResources(this, api);
  }

  createApi() {
    const api = new RestApi(this, `KentobotAPI-${this.environmentName}`, {
      description: `API for Kentobot Twitch Bot (${this.environmentName})`,
      deployOptions: {
        stageName: this.environmentName,
        accessLogDestination: new LogGroupLogDestination(
          new LogGroup(this, 'ApiLogs')
        ),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields()
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'Access-Control-Allow-Origin'
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS
      }
    });

    const plan = api.addUsagePlan(`UsagePlan-${this.environmentName}`, {
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });

    const apiKey = new ApiKey(this, `KentobotApiKey-${this.environmentName}`);
    plan.addApiKey(apiKey);
    plan.addApiStage({
      stage: api.deploymentStage
    });

    return {
      api,
      stage: api.deploymentStage
    };
  }

  createSongRequestAPIResources = (scope: Construct, api: RestApi) => {
    const songRequestEndpointResource = api.root.addResource('song-requests');

    // Create the HTTP Resources
    const getRequestResource = songRequestEndpointResource
      .addResource('request')
      .addResource('{songId}');

    const getAllRequestsResource =
      songRequestEndpointResource.addResource('all-requests');

    const saveRequestResource = songRequestEndpointResource.addResource('save');

    const getAllPlaysResource = songRequestEndpointResource
      .addResource('plays')
      .addResource('{songId}');

    const {
      publicVideoToggle,
      requestDurationLimit,
      djRequestDurationLimit,
      licensedContentToggle
    } = createSongRequestParameters(this, this.environmentName);

    const songRequestComamndsLambda = new NodejsFunction(
      this,
      `KB-API-SongRequestCommands-${this.environmentName}`,
      {
        functionName: `KB-API-SongRequestCommands-${this.environmentName}`,
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../src/api/',
          'song-request/lambdas/command.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: RetentionDays.ONE_WEEK,
        environment: {
          ENVIRONMENT: this.environmentName
          // STREAM_DATA_TABLE: this.database.tableName
        },
        timeout: Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    saveRequestResource.addMethod(
      'POST',
      new LambdaIntegration(songRequestComamndsLambda, {})
    );

    const songRequestQueriesLambda = new NodejsFunction(
      this,
      `KB-API-SongRequestQueries-${this.environmentName}`,
      {
        functionName: `KB-API-SongRequestQueries-${this.environmentName}`,
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../src/api/',
          'song-request/lambdas/query.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: RetentionDays.ONE_WEEK,
        environment: {
          ENVIRONMENT: this.environmentName,
          PUBLIC_VIDEO_TOGGLE_NAME: publicVideoToggle.parameterName,
          REQUEST_DURATION_NAME: requestDurationLimit.parameterName,
          DJ_HOUR_REQUEST_DURATION_NAME: djRequestDurationLimit.parameterName,
          LICENSED_VIDEO_TOGGLE_NAME: licensedContentToggle.parameterName
          // STREAM_DATA_TABLE: this.database.tableName
        },
        timeout: Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    getRequestResource.addMethod(
      'GET',
      new LambdaIntegration(songRequestQueriesLambda, {}),
      {}
    );

    publicVideoToggle.grantRead(songRequestQueriesLambda);
    requestDurationLimit.grantRead(songRequestQueriesLambda);
    djRequestDurationLimit.grantRead(songRequestQueriesLambda);
    licensedContentToggle.grantRead(songRequestQueriesLambda);
  };
}
