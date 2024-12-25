#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { KentobotStage } from '../lib/kentobot-stage';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') as string;

const account = '101639835597';
const region = 'us-east-1';

new KentobotStage(app, 'Dev', {
  environmentName: 'dev',
  env: {
    account: account,
    region: region
  }
});

new KentobotStage(app, 'Prod', {
  environmentName: 'prod',
  env: {
    account: account,
    region: region
  }
});
