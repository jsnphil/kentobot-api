import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { ARCHITECTURE, NODE_RUNTIME } from '../CDKConstants';
import { Api } from '../constructs/api';

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

    // const eventBus = new events.EventBus(this, 'EventBus', {
    // eventBusName: 'EventBus',
    // });

    // const rule = new events.Rule(this, 'Rule', {
    // eventBus,
    // ruleName: 'EventRule',
    // eventPattern: {
    //     source: ['com.example'],
    //     detailType: ['exampleDetailType'],
    // },
    // });

    // const lambdaFunction = new Function(this, 'LambdaFunction', {
    // runtime: Runtime.NODEJS_14_X,
    // handler: 'index.handler',
    // code: Code.fromAsset('lambda'),
    // });

    // rule.addTarget(new LambdaFunction(lambdaFunction));

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
      entry: 'src/lambdas/twitch/twitch-webhook.ts',
      handler: 'handler',
      environment: {
        TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || '',
        TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || '',
        TWITCH_SECRET: 'secret key',
        TWITCH_WEBHOOK_CALLBACK_URL:
          process.env.TWITCH_WEBHOOK_CALLBACK_URL || '',
        TWITCH_WEBHOOK_CALLBACK_PORT:
          process.env.TWITCH_WEBHOOK_CALLBACK_PORT || '3000'
      },
      architecture: ARCHITECTURE
    });

    twitchResource.addResource('events').addMethod(
      'POST',
      new apiGateway.LambdaIntegration(twitchWebHook, {
        proxy: true,
        allowTestInvoke: true
      })
    );
  }
}
