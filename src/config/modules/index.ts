import cognito, { CognitoConfigType } from './cognito';
import handler, { HandlerConfigType } from './handler';
import s3, { S3ConfigType } from './s3';

export * from './cognito';
export * from './s3';
export * from './handler';

export type AppConfigFunctionType = {
  cognito: () => CognitoConfigType;
  s3: () => S3ConfigType;
  handler: () => HandlerConfigType;
};

export type AppConfigType = CognitoConfigType;

export default { cognito, s3, handler };
