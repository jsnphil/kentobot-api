import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import path = require('path');
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as apiGateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apiGatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { Construct } from 'constructs';
import { ARCHITECTURE, NODE_RUNTIME } from '../CDKConstants';

export interface WebSocketStackProps extends cdk.StackProps {
  environmentName: string;
}

export class WebSocketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const tableArn = cdk.Fn.importValue(`table-arn-${props.environmentName}`);
    const database = ddb.Table.fromTableAttributes(
      this,
      `stream-data-${props.environmentName}`,
      {
        tableArn: tableArn
      }
    );

    const messageHandler = new lambda.NodejsFunction(this, 'message-handler', {
      runtime: NODE_RUNTIME,
      handler: 'handler',
      entry: path.join(
        __dirname,
        '../../src/lambdas/',
        'web-sockets/message-handler.ts'
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
        STREAM_DATA_TABLE: database.tableName
      }
    });

    database.grantReadWriteData(messageHandler);

    const webSocketApi = new apiGateway.WebSocketApi(this, 'Kentobot-WSS', {
      apiName: `KentobotWSS-${props.environmentName}`,
      description: `Kentobot Web Socket API for ${props.environmentName}`,
      connectRouteOptions: {
        integration: new apiGatewayIntegrations.WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      },
      disconnectRouteOptions: {
        integration: new apiGatewayIntegrations.WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      },
      defaultRouteOptions: {
        integration: new apiGatewayIntegrations.WebSocketLambdaIntegration(
          'SendMessageIntegration',
          messageHandler
        )
      }
    });

    new cdk.CfnOutput(this, `WebSocket-Api-Id-Export`, {
      value: webSocketApi.apiId,
      description: 'The ID of the Web Socket API',
      exportName: `websocket-api-id-${props.environmentName}`
    });

    const stage = new apiGateway.WebSocketStage(this, 'web-socket-stage', {
      webSocketApi,
      stageName: props.environmentName,
      autoDeploy: true
    });

    new cdk.CfnOutput(this, `WebSocket-Api-Stage-Export`, {
      value: stage.stageName,
      description: 'The name of the Web Socket stage',
      exportName: `websocket-stage-name-${props.environmentName}`
    });

    webSocketApi.addRoute('sendmessage', {
      integration: new apiGatewayIntegrations.WebSocketLambdaIntegration(
        'SendMessageIntegration',
        messageHandler
      )
    });

    messageHandler.addEnvironment('WEBSOCKET_API_ID', webSocketApi.apiId);
    messageHandler.addEnvironment('WEB_SOCKET_STAGE', stage.stageName);

    webSocketApi.grantManageConnections(messageHandler);
  }
}
