import * as cdk from 'aws-cdk-lib';

// TODO Combine these
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as webSocketGateway from 'aws-cdk-lib/aws-apigatewayv2';

import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { createSongRequestParameters } from '../constructs/song-request-parameters';
import { ARCHITECTURE, lambdaEnvironment, NODE_RUNTIME } from '../CDKConstants';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');
import {
  errorResponses,
  getSongPlaysResponseModel,
  saveSongPlayResponseModel,
  saveSongRequestModel,
  songRequestDetailsModel
} from '../constructs/api-models';
import { EventBus } from '../constructs/event-bus';
import { Api } from '../constructs/api';
import { WSSBroadcastRestEndpoint } from '../constructs/WSSBroadcastLambdaEndpoint';

export interface ApiStackProps extends cdk.StackProps {
  environmentName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // ***********************
    // Import shared resources
    // ***********************
    const tableArn = cdk.Fn.importValue(`table-arn-${props.environmentName}`);

    const tableStreamArn = cdk.Fn.importValue(
      `database-stream-arn-${props.environmentName}`
    );

    const database = ddb.Table.fromTableAttributes(
      this,
      `stream-data-${props.environmentName}`,
      {
        tableArn: tableArn,
        tableStreamArn: tableStreamArn
      }
    );

    const webSocketApiId = cdk.Fn.importValue(
      `websocket-api-id-${props.environmentName}`
    );

    const webSocketApiStage = cdk.Fn.importValue(
      `websocket-stage-name-${props.environmentName}`
    );

    const webSocketApi =
      webSocketGateway.WebSocketApi.fromWebSocketApiAttributes(
        this,
        'web-socket-api',
        {
          webSocketId: webSocketApiId
        }
      );

    // ***********************
    // Setup main resources
    // ***********************
    const eventBus = new EventBus(this, 'Kentobot-Event-Bus', {
      environmentName: props.environmentName
    });

    const api = new Api(this, 'Kentobot-API', props);
    api.createApiKey('kentobot');
    api.createApiKey('kentobeans-live');

    // ***********************
    // Setup song request resources
    // ***********************
    const songRequestEndpointResource =
      api.apiGateway.root.addResource('songs');

    // ***********************
    // Save song data resource
    // ***********************
    const saveSongQueue = new sqs.Queue(this, 'save-song-data', {
      queueName: `${props.environmentName}-save-song-data`,
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(14),
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: new sqs.Queue(this, 'save-song-data-dlq', {
          queueName: `${props.environmentName}-save-song-data-dlq`
        })
      }
    });

    // const playedSongEventLambda = new lambda.NodejsFunction(
    //   this,
    //   'playedSongEventHandler',
    //   {
    //     runtime: NODE_RUNTIME,
    //     handler: 'handler',
    //     entry: path.join(
    //       __dirname,
    //       '../../src/lambdas/rest-api/',
    //       'song-request/save-song-data.ts'
    //     ),
    //     bundling: {
    //       minify: false,
    //       externalModules: ['aws-sdk']
    //     },
    //     logRetention: logs.RetentionDays.ONE_WEEK,
    //     environment: {
    //       ENVIRONMENT: props.environmentName,
    //       STREAM_DATA_TABLE: database.tableName
    //     },
    //     timeout: cdk.Duration.minutes(1),
    //     memorySize: 512,
    //     architecture: ARCHITECTURE
    //   }
    // );

    // playedSongEventLambda.addEventSource(
    //   new lambdaEventSources.SqsEventSource(saveSongQueue, {
    //     batchSize: 1
    //   })
    // );

    // saveSongQueue.grantConsumeMessages(playedSongEventLambda);
    // database.grantReadWriteData(playedSongEventLambda);

    eventBus.addQueueTarget(this, 'save-song-data-target', {
      source: 'kentobot-api',
      eventPattern: {
        detailType: ['song-played']
      },
      queue: saveSongQueue
    });

    // Save song played endpoint
    // const saveSongResource = songRequestEndpointResource.addResource('save');

    api.role.attachInlinePolicy(
      new iam.Policy(this, 'put-events-policy', {
        statements: [
          new iam.PolicyStatement({
            actions: ['events:PutEvents'],
            effect: iam.Effect.ALLOW,
            resources: [eventBus.bus.eventBusArn]
          })
        ]
      })
    );

    const saveSongPlayedIntegration = new apiGateway.AwsIntegration({
      service: 'events',
      action: 'PutEvents',
      options: {
        credentialsRole: api.role,
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
                    "EventBusName": "${eventBus.bus.eventBusName}"
                  }
                ]
              }`
        }
      }
    });

    // saveSongResource.addMethod('POST', saveSongPlayedIntegration, {
    //   apiKeyRequired: true,
    //   methodResponses: [
    //     {
    //       statusCode: '200',
    //       responseModels: {
    //         'application/json': saveSongPlayResponseModel(this, api.apiGateway)
    //       }
    //     },
    //     ...errorResponses
    //   ],
    //   requestValidator: new apiGateway.RequestValidator(
    //     this,
    //     'body-validator',
    //     {
    //       restApi: api.apiGateway,
    //       requestValidatorName: 'body-validator',
    //       validateRequestBody: true
    //     }
    //   ),
    //   requestModels: {
    //     'application/json': saveSongRequestModel(this, api.apiGateway)
    //   }
    // });

    // ***********************
    // Get song details and plays endpoint
    // ***********************
    const getSongRequestResource =
      songRequestEndpointResource.addResource('{songId}');

    const getSongRequestDetailsResource =
      getSongRequestResource.addResource('details');

    const getSongRequestPlaysResource =
      getSongRequestResource.addResource('plays');

    api.role.attachInlinePolicy(
      new iam.Policy(this, `api-dynamodb-policy`, {
        statements: [
          new iam.PolicyStatement({
            actions: ['dynamodb:GetItem', 'dynamodb:Query'],
            effect: iam.Effect.ALLOW,
            resources: [database.tableArn]
          })
        ]
      })
    );

    // ***********************
    // Get song details
    // ***********************
    const getSongRequestDetailsIntegration = new apiGateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: api.role,
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

    getSongRequestDetailsResource.addMethod(
      'GET',
      getSongRequestDetailsIntegration,
      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': songRequestDetailsModel(this, api.apiGateway)
            }
          },
          ...errorResponses
        ]
      }
    );

    // ***********************
    // Get song plays endpoint
    // ***********************
    const getSongRequestPlaysIntegration = new apiGateway.AwsIntegration({
      service: 'dynamodb',
      action: 'Query',
      options: {
        credentialsRole: api.role,
        passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_MATCH,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `{
                #if($input.path('$.Items') && $input.path('$.Items').size() > 0)
                  #set($inputRoot = $input.path('$'))
                  "youtubeId": "$method.request.path.songId",
                  "plays": [
                    #foreach($item in $inputRoot.Items)
                    {
                      "date": "$item.request_date.S",
                      "requestedBy": "$item.requested_by.S",
                      "sotnContender": $item.sotn_contender.BOOL,
                      "sotnWinner": $item.sotn_winner.BOOL,
                      "sotsWinner": $item.sots_winner.BOOL
                    }
                    #if($foreach.hasNext),#end 
                    #end
                  ]
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
            "TableName": "${database.tableName}",
            "KeyConditionExpression": "pk = :pk AND begins_with(sk, :sk)",
            "ExpressionAttributeValues": {
              ":pk": {
                "S": "yt#$method.request.path.songId"
              },
              ":sk": {
                "S": "songPlay"
              }
            }
          }`
        }
      }
    });

    getSongRequestPlaysResource.addMethod(
      'GET',
      getSongRequestPlaysIntegration,
      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': getSongPlaysResponseModel(
                this,
                api.apiGateway
              )
            }
          },
          ...errorResponses
        ]
      }
    );

    // Get all songs endpoint
    const getAllSongRequestsLambda = new lambda.NodejsFunction(
      this,
      'GetAllSongRequests',
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../../src/lambdas/rest-api/',
          'song-request/get-all-song-requests.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          STREAM_DATA_TABLE: database.tableName
        },
        timeout: cdk.Duration.seconds(30),
        memorySize: 2048,
        architecture: ARCHITECTURE
      }
    );

    database.grantReadData(getAllSongRequestsLambda);

    getAllSongRequestsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${database.tableArn}/index/gsi1`]
      })
    );

    songRequestEndpointResource.addMethod(
      'GET',
      new apiGateway.LambdaIntegration(getAllSongRequestsLambda)
    );

    // ***********************
    // Queue Management Resources
    // ***********************

    // ************************
    // New stream-based endpoints
    // ************************
    const streamEndpointResource = api.apiGateway.root.addResource('streams');

    // Start stream endpoints
    const startStreamLambda = new lambda.NodejsFunction(this, 'StartStream', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/api/', 'start-stream.ts'),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ENVIRONMENT: props.environmentName,
        STREAM_DATA_TABLE: database.tableName
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE
    });

    database.grantReadWriteData(startStreamLambda);

    streamEndpointResource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(startStreamLambda),
      {
        apiKeyRequired: true
      }
    );

    // TODO Get active stream
    // TODO Get stream by date
    // TODO Delete/end stream

    // Queue management endpoints
    const queueEndpoint = streamEndpointResource
      .addResource('current')
      .addResource('queue');

    // ***********************
    // Request song resource
    // ***********************
    const {
      publicVideoToggle,
      requestDurationLimit,
      djRequestDurationLimit,
      licensedContentToggle,
      maxSongRequestsPerUser
    } = createSongRequestParameters(this, props.environmentName);

    const youtubeApiKeyParameter =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'ApiKeyParameter',
        {
          parameterName: 'youtube-api-key'
        }
      );

    const songRequestLambda = new lambda.NodejsFunction(this, 'RequestSong', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/api/request-song.ts'),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ENVIRONMENT: props.environmentName,
        PUBLIC_VIDEO_TOGGLE_NAME: publicVideoToggle.parameterName,
        REQUEST_DURATION_NAME: requestDurationLimit.parameterName,
        DJ_HOUR_REQUEST_DURATION_NAME: djRequestDurationLimit.parameterName,
        LICENSED_VIDEO_TOGGLE_NAME: licensedContentToggle.parameterName,
        MAX_SONGS_PER_USER: maxSongRequestsPerUser.parameterName,
        STREAM_DATA_TABLE: database.tableName,
        WEBSOCKET_API_ID: webSocketApi.apiId,
        WEB_SOCKET_STAGE: webSocketApiStage,
        EVENT_BUS_NAME: eventBus.bus.eventBusName
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE
    });

    publicVideoToggle.grantRead(songRequestLambda);
    requestDurationLimit.grantRead(songRequestLambda);
    djRequestDurationLimit.grantRead(songRequestLambda);
    licensedContentToggle.grantRead(songRequestLambda);
    youtubeApiKeyParameter.grantRead(songRequestLambda);
    maxSongRequestsPerUser.grantRead(songRequestLambda);
    database.grantReadWriteData(songRequestLambda);
    eventBus.bus.grantPutEventsTo(songRequestLambda);

    const requestSongEndpoint = queueEndpoint.addResource('request-song');
    requestSongEndpoint.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(songRequestLambda),
      {
        apiKeyRequired: true
      }
    );

    /* Remove song from queue endpoint */
    const removeRequestLambda = new lambda.NodejsFunction(
      this,
      'RemoveRequest',
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(__dirname, '../../src/api', 'remove-song.ts'),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          ...lambdaEnvironment,
          ENVIRONMENT: props.environmentName,
          STREAM_DATA_TABLE: database.tableName,
          WEBSOCKET_API_ID: webSocketApi.apiId,
          WEB_SOCKET_STAGE: webSocketApiStage,
          EVENT_BUS_NAME: eventBus.bus.eventBusName
        },
        timeout: cdk.Duration.minutes(1),
        memorySize: 512,
        architecture: ARCHITECTURE
      }
    );

    database.grantReadWriteData(removeRequestLambda);
    eventBus.bus.grantPutEventsTo(removeRequestLambda);

    const removeRequestResource = queueEndpoint
      .addResource('remove-request')
      .addResource('{songId}');

    removeRequestResource.addMethod(
      'DELETE',
      new apiGateway.LambdaIntegration(removeRequestLambda),
      {
        apiKeyRequired: true
      }
    );

    // ***********************
    // Move Request Endpoint
    // ***********************

    const moveSongResource = queueEndpoint
      .addResource('move-request')
      .addResource('{songId}');

    const moveRequestLambda = new lambda.NodejsFunction(this, 'MoveRequest', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/api/move-request.ts'),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ENVIRONMENT: props.environmentName,
        STREAM_DATA_TABLE: database.tableName,
        EVENT_BUS_NAME: eventBus.bus.eventBusName
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE
    });

    database.grantReadWriteData(moveRequestLambda);

    moveSongResource.addMethod(
      'PATCH',
      new apiGateway.LambdaIntegration(moveRequestLambda),
      {
        apiKeyRequired: true
      }
    );

    // ***********************
    // Bump song resource
    // ***********************

    const getQueueLambda = new lambda.NodejsFunction(this, 'GetQueue', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/api/get-queue.ts'),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ENVIRONMENT: props.environmentName,
        STREAM_DATA_TABLE: database.tableName
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE
    });

    database.grantReadData(getQueueLambda);

    queueEndpoint.addMethod(
      'GET',
      new apiGateway.LambdaIntegration(getQueueLambda)
    );

    // ***********************
    // Shuffle endpoints
    // ***********************

    const shuffleResource = queueEndpoint.addResource('shuffle');

    const shuffleLambda = new lambda.NodejsFunction(this, 'Shuffle', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/api/shuffle.ts'),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        ...lambdaEnvironment,
        ENVIRONMENT: props.environmentName,
        STREAM_DATA_TABLE: database.tableName,
        EVENT_BUS_NAME: eventBus.bus.eventBusName
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE
    });

    database.grantReadWriteData(shuffleLambda);

    const toggleShuffleResource = shuffleResource.addResource('toggle');

    toggleShuffleResource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(shuffleLambda),
      {
        apiKeyRequired: true
      }
    );

    const enterShuffleResource = shuffleResource.addResource('enter');

    enterShuffleResource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(shuffleLambda),
      {
        apiKeyRequired: true
      }
    );

    const selectShuffleWinnerResource =
      shuffleResource.addResource('select-winner');

    selectShuffleWinnerResource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(shuffleLambda),
      {
        apiKeyRequired: true
      }
    );

    eventBus.bus.grantPutEventsTo(shuffleLambda);

    /*  End of stream-based endpoints*/

    const streamEventHandler = new lambda.NodejsFunction(
      this,
      'streamEventHandler',
      {
        runtime: NODE_RUNTIME,
        handler: 'handler',
        entry: path.join(
          __dirname,
          '../../src/domains/stream/event-handlers/stream-event-handler.ts'
        ),
        bundling: {
          minify: false,
          externalModules: ['aws-sdk']
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
        environment: {
          ...lambdaEnvironment,
          ENVIRONMENT: props.environmentName,
          STREAM_DATA_TABLE: database.tableName,
          WEBSOCKET_API_ID: webSocketApi.apiId,
          WEB_SOCKET_STAGE: webSocketApiStage
        }
      }
    );

    eventBus.addLambdaTarget(this, 'stream-event-event-rule', {
      source: 'kentobot.streaming.system',
      eventPattern: {
        detailType: [
          'song-added-to-queue',
          'song-removed-from-queue',
          'song-moved-in-queue',
          'song-bumped-in-queue'
        ]
      },
      lambda: streamEventHandler
    });

    database.grantReadData(streamEventHandler);

    streamEventHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['execute-api:ManageConnections'],
        resources: [
          `arn:aws:execute-api:${props.env?.region}:${props.env?.account}:${webSocketApi.apiId}/*/*/@connections/*`
        ]
      })
    );
  }
}
