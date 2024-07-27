#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
// import { DataMigrationStack } from '../lib/data-migration-stack';
import { DataStack } from '../lib/data-stack';
import { Tags } from 'aws-cdk-lib';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') as string;

if (!environment) {
  throw Error('No environment set');
}

const dataStack = new DataStack(app, `KB-DataStack-${environment}`, {
  environment
});

const apiStack = new ApiStack(app, `KB-ApiStack-${environment}`, {
  environment
});

// dataStack.addDependency(apiStack);
// dataStack.addDependency(dataMigrationStack);
apiStack.addDependency(dataStack);

Tags.of(app).add('environment', environment);
Tags.of(dataStack).add('system', 'data-repository');
Tags.of(dataStack).add('system', 'api');
// Tags.of(dataMigrationStack).add('system', 'data-migration');
