import type { AWS } from '@serverless/typescript';

import * as dotenv from 'dotenv';

dotenv.config();

import modules from '@functions/index';

const functions = {};

for (const module of modules) {
  functions[module.name] = module;
}

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
