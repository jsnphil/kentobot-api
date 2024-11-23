import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as apiGatewayV2 from 'aws-cdk-lib/aws-apigatewayv2';

import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';

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

    // Create the event bus
    const bus = new events.EventBus(
      this,
      `kentobot-event-bus-${props.environmentName}`,
      {
        eventBusName: `Kentobot-EventBus-${props.environmentName}`
      }
    );

    bus.archive(`kentobot-event-archive-${props.environmentName}`, {
      archiveName: `KentobotEventArchive-${props.environmentName}`,
      eventPattern: {
        account: [cdk.Stack.of(this).account]
      },
      retention: cdk.Duration.days(365)
    });

    const eventLoggerRule = new events.Rule(
      this,
      `kentobot-event-logger-rule`,
      {
        description: 'Log all events',
        eventPattern: {
          region: ['us-east-1']
        },
        eventBus: bus
      }
    );

    const saveSongQueue = new sqs.Queue(
      this,
      `save-song-data-${props.environmentName}`,
      {
        queueName: `save-song-data-${props.environmentName}`,
        visibilityTimeout: cdk.Duration.seconds(300),
        retentionPeriod: cdk.Duration.days(14),
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: new sqs.Queue(
            this,
            `save-song-data-dlq-${props.environmentName}`,
            {
              queueName: `save-song-data-dlq-${props.environmentName}`
            }
          )
        }
      }
    );

    const savePlayedSongLambda = new lambda.NodejsFunction(
      this,
      `SavePlayedSong-${props.environmentName}`,
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../src/api/',
          'song-request/lambdas/save-song-data.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          ENVIRONMENT: props.environmentName
          // STREAM_DATA_TABLE: this.database.tableName
        },
        timeout: cdk.Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    savePlayedSongLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(saveSongQueue, {
        batchSize: 1
      })
    );

    saveSongQueue.grantConsumeMessages(savePlayedSongLambda);

    const saveSongDataRule = new events.Rule(
      this,
      `save-song-data-rule-${props.environmentName}`,
      {
        eventBus: bus,
        eventPattern: {
          source: ['kentobot-api'],
          detailType: ['song-played']
        }
      }
    );

    saveSongDataRule.addTarget(new eventsTargets.SqsQueue(saveSongQueue));

    const eventProducerLambda = new lambda.NodejsFunction(
      this,
      `EventProducer-${props.environmentName}`,
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(__dirname, '../src/api/', 'event-producer.ts'),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          ENVIRONMENT: props.environmentName,
          EVENT_BUS_NAME: bus.eventBusName
          // STREAM_DATA_TABLE: this.database.tableName
        },
        timeout: cdk.Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    bus.grantPutEventsTo(eventProducerLambda);

    const saveSongResource = songRequestEndpointResource.addResource('save');
    saveSongResource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(eventProducerLambda)
    );
  }
}
