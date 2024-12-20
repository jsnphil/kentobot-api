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
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { createSongRequestParameters } from './song-request-parameters';
import { ARCHITECTURE, NODE_RUNTIME } from './CDKConstants';
import path = require('path');
import {
  saveSongPlayResponseModel,
  saveSongRequestModel,
  songRequestDetailsModel
} from './api-models';

export interface ApiStackProps extends cdk.StackProps {
  environmentName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Import shared resources
    const tableArn = cdk.Fn.importValue(`table-arn-${props.environmentName}`);

    // const tableStreamArn = Fn.importValue(
    //   `kb-data-table-arn-${this.environmentName}`
    // );

    const database = ddb.Table.fromTableAttributes(
      this,
      `stream-data-${props.environmentName}`,
      {
        tableArn: tableArn
        // tableStreamArn: tableStreamArn
      }
    );

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

    const apiGatewayRole = new iam.Role(
      this,
      `${props.environmentName}-api-role`,
      {
        assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
      }
    );

    const songRequestEndpointResource = api.root.addResource('song-requests');

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

    const playedSongEventLambda = new lambda.NodejsFunction(
      this,
      `playedSongEventHandler-${props.environmentName}`,
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
          ENVIRONMENT: props.environmentName,
          STREAM_DATA_TABLE: database.tableName
        },
        timeout: cdk.Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    playedSongEventLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(saveSongQueue, {
        batchSize: 1
      })
    );

    saveSongQueue.grantConsumeMessages(playedSongEventLambda);
    database.grantReadWriteData(playedSongEventLambda);

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

    const errorResponses = [
      {
        selectionPattern: '4\\d{2}', // Match all 4xx errors
        statusCode: '400',
        responseTemplates: {
          'application/json': `{
            "code": 400,
            "message": "Invalid input",
            "errors": []
          }`
        }
      },
      {
        selectionPattern: '5\\d{2}', // Match all 5xx errors
        statusCode: '500',
        responseTemplates: {
          'application/json': `{
            "code": 500,
            "message": "Invalid input",
            "errors": []
          }`
        }
      }
    ];

    // Save song played endpoint
    const saveSongResource = songRequestEndpointResource.addResource('save');

    const putEventsPolicy = new iam.Policy(
      this,
      `${props.environmentName}-put-events-policy`,
      {
        statements: [
          new iam.PolicyStatement({
            actions: ['events:PutEvents'],
            effect: iam.Effect.ALLOW,
            resources: [bus.eventBusArn]
          })
        ]
      }
    );

    apiGatewayRole.attachInlinePolicy(putEventsPolicy);

    const saveSongPlayedIntegration = new apiGateway.AwsIntegration({
      service: 'events',
      action: 'PutEvents',
      options: {
        credentialsRole: apiGatewayRole,
        passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_MATCH,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `
                  #set($context.responseOverride.status = 202)
                  {
                  "message": "Song request play received",
                  "eventId": "$input.path('$.Entries[0].EventId')"
                  }`
            },
            selectionPattern: '2\\d{2}'
          },
          ...errorResponses
        ],
        requestTemplates: {
          'application/json': `
              #set($inputRoot = $input.path('$'))
              #set($context.requestOverride.header.X-Amz-Target = "AWSEvents.PutEvents")
              #set($context.requestOverride.header.Content-Type = "application/x-amz-json-1.1")
              {
                "Entries": [
                  {
                    "DetailType": "song-played",
                    "Source": "kentobot-api",
                    "Detail": "{\\"title\\": \\"$inputRoot.title\\", \\"youtubeId\\": \\"$inputRoot.youtubeId\\", \\"length\\": $inputRoot.length, \\"requestedBy\\": \\"$inputRoot.requestedBy\\", \\"played\\": \\"$inputRoot.played\\"}",
                    "EventBusName": "${bus.eventBusName}"
                  }
                ]
              }`
        }
      }
    });

    saveSongResource.addMethod('POST', saveSongPlayedIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': saveSongPlayResponseModel(this, api)
          }
        },
        ...errorResponses
      ],
      requestValidator: new apiGateway.RequestValidator(
        this,
        'body-validator',
        {
          restApi: api,
          requestValidatorName: 'body-validator',
          validateRequestBody: true
        }
      ),
      requestModels: { 'application/json': saveSongRequestModel(this, api) }
    });

    // Get song request details endpoint
    const getSongRequestResource =
      songRequestEndpointResource.addResource('{songId}');

    const getSongRequestDetailsResource =
      getSongRequestResource.addResource('details');

    const getItemPolicy = new iam.Policy(
      this,
      `${props.environmentName}-get-item-policy`,
      {
        statements: [
          new iam.PolicyStatement({
            actions: ['dynamodb:GetItem'],
            effect: iam.Effect.ALLOW,
            resources: [database.tableArn]
          })
        ]
      }
    );

    apiGatewayRole.attachInlinePolicy(getItemPolicy);

    const getSongRequestIntegration = new apiGateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: apiGatewayRole,
        passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_MATCH,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `{
                #if($input.path('$.Item') && $input.path('$.Item').size() > 0)
                "items": [{
                  "youtubeId": "$input.path('$.Item.youtube_id.S')",
                  "title": "$input.path('$.Item.song_title.S')",
                  "length": $input.path('$.Item.song_length.N')
                  }]
                #else
                #set($context.responseOverride.status = 404)
                "code": 404,
                "message": "Not found",
                "errors": ["No request found with ID [$method.request.path.songId]."]
                #end
              }`
            },
            selectionPattern: '2\\d{2}' // Match all 2xx successful responses
          },
          // Not Found Response: No Items
          {
            statusCode: '404',
            responseTemplates: {
              'application/json': `{
                "code": 404,
                "message": "Not found",
                "errors": ["No request found with ID [$method.request.path.songId]."]
              }`
            },
            selectionPattern: '.*"error":.*' // Match when "error" exists in the output
          },
          ...errorResponses
        ],
        requestTemplates: {
          'application/json': `{
            "Key": {
              "pk": {
                "S": "yt#$method.request.path.songId"
              },
              "sk": {
                "S": "songInfo"
              }
            },
            "TableName": "${database.tableName}"
          }`
        }
      }
    });

    getSongRequestDetailsResource.addMethod('GET', getSongRequestIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': songRequestDetailsModel(this, api)
          }
        },
        ...errorResponses
      ]
    });
  }
}
