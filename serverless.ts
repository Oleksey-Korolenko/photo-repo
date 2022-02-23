import type { AWS } from '@serverless/typescript';

import modules from '@functions/index';

import * as dotenv from 'dotenv';

const functions = {};

for (const module of modules) {
  functions[module.name] = module;
}

dotenv.config();

const serverlessConfiguration: AWS = {
  service: 'photo-repo',
  org: 'bubo2scandiacus',
  app: 'photo-repo',
  frameworkVersion: '3',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
  },
  functions,
};

module.exports = serverlessConfiguration;
