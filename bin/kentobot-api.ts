#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { KentobotCoreStage } from './kentobot-stage';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') as string;

const account = '101639835597';
const region = 'us-east-1';

new KentobotCoreStage(app, 'Dev', {
  environmentName: 'dev',
  env: {
    account: account,
    region: region
  }
});

// new KentobotCoreStage(app, 'Prod', {
//   environmentName: 'prod',
//   env: {
//     account: account,
//     region: region
//   }
// });
