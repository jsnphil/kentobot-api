import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';
import path = require('path');
import { NODE_RUNTIME, ARCHITECTURE } from './CDKConstants';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { webcrypto } from 'crypto';

export class WebSocketsPocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const connectionTable = new ddb.Table(this, 'connections-table', {
      partitionKey: {
        name: 'pk',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: ddb.AttributeType.STRING
      },
      tableName: 'connections-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const messageHandler = new lambda.NodejsFunction(this, 'message-handler', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(
        __dirname,
        '../src/api/',
        'song-request/web-sockets/message-handler.ts'
      ),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk']
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
      architecture: ARCHITECTURE,
      environment: {
        CONNECTIONS_TABLE: connectionTable.tableName
      }
    });

    connectionTable.grantReadWriteData(messageHandler);

    const webSocketApi = new apiGateway.WebSocketApi(this, 'web-socket-api', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      }
    });

    new apiGateway.WebSocketStage(this, 'web-socket-stage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true
    });

    webSocketApi.addRoute('sendmessage', {
      integration: new WebSocketLambdaIntegration(
        'SendMessageIntegration',
        messageHandler
      )
    });

    webSocketApi.grantManageConnections(messageHandler);
  }
}
