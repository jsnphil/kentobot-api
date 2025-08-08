import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ARCHITECTURE, lambdaEnvironment, NODE_RUNTIME } from '../CDKConstants';

export interface EventSubscriptionStackProps extends cdk.StackProps {
  environmentName: string;
}

export class EventSubscriptionStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: EventSubscriptionStackProps
  ) {
    super(scope, id, props);

    const streamDataTableArn = cdk.Fn.importValue(
      `stream-data-table-arn-${props.environmentName}`
    );

    const streamDataTable = ddb.Table.fromTableAttributes(
      this,
      `stream-data-table-${props.environmentName}`,
      {
        tableArn: streamDataTableArn
      }
    );

    const bus = new events.EventBus(this, 'kentobot-event-bus', {
      eventBusName: `Kentobot-EventBus-${props.environmentName}-primary`
    });

    bus.archive('kentobot-event-archive-primary', {
      archiveName: `KentobotEventArchive-${props.environmentName}-primary`,
      eventPattern: {
        account: [cdk.Stack.of(this).account]
      },
      retention: cdk.Duration.days(365) // TODO Shorten this
    });

    
    new events.Rule(this, `kentobot-event-logger-rule-primary`, {
      description: 'Log all events',
      eventPattern: {
        region: ['us-east-1']
      },
      eventBus: bus
    });

    const twitchWebHookApi = new apiGateway.RestApi(this, `TwitchWebHookApi`, {
      restApiName: `TwitchWebHookApi-${props.environmentName}`,
      description: `Twitch WebHook API for ${props.environmentName}`,
      deployOptions: {
        stageName: props.environmentName,
        loggingLevel: apiGateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      }
    });

    const twitchResource = twitchWebHookApi.root.addResource('twitch');

    const twitchWebHook = new lambda.NodejsFunction(this, 'TwitchWebHook', {
      runtime: NODE_RUNTIME,
      entry: 'src/apps/twitch/twitch-webhook.ts',
      handler: 'handler',
      environment: {
        ...lambdaEnvironment,
        TWITCH_SECRET: 'secret-key',
        TWITCH_WEBHOOK_CALLBACK_URL:
          process.env.TWITCH_WEBHOOK_CALLBACK_URL || '',
        TWITCH_WEBHOOK_CALLBACK_PORT:
          process.env.TWITCH_WEBHOOK_CALLBACK_PORT || '3000',
        EVENT_BUS_NAME: bus.eventBusName
      },
      architecture: ARCHITECTURE
    });

    bus.grantPutEventsTo(twitchWebHook);

    twitchResource.addResource('events').addMethod(
      'POST',
      new apiGateway.LambdaIntegration(twitchWebHook, {
        proxy: true,
        allowTestInvoke: true
      })
    );

    // const twitchClientId =
    //   ssm.StringParameter.fromSecureStringParameterAttributes(
    //     this,
    //     'TwitchClientId',
    //     {
    //       parameterName: '/dev/twitch/client-id', // Replace with your parameter name
    //       version: 1
    //     }
    //   );

    // const twitchClientSecret =
    //   ssm.StringParameter.fromSecureStringParameterAttributes(
    //     this,
    //     'TwitchClientSecret',
    //     {
    //       parameterName: '/dev/twitch/client-secret', // Replace with your parameter name
    //       version: 1
    //     }
    //   );

    const appTokenLambda = new lambda.NodejsFunction(this, 'TwitchAppToken', {
      runtime: NODE_RUNTIME,
      entry: 'src/apps/twitch/get-app-token.ts',
      handler: 'handler',
      environment: {
        // TWITCH_CLIENT_ID: twitchClientId.stringValue,
        // TWITCH_CLIENT_SECRET: twitchClientSecret.stringValue,
        TABLE_NAME: streamDataTable.tableName
      },
      architecture: ARCHITECTURE
    });

    streamDataTable.grantReadWriteData(appTokenLambda);

    // TODO Add API key
    twitchResource.addResource('app-token').addMethod(
      'GET',
      new apiGateway.LambdaIntegration(appTokenLambda, {
        proxy: true,
        allowTestInvoke: true
      })
    );
  }
}
