import cognito, { CognitoConfigType } from './cognito';
import s3, { S3ConfigType } from './s3';

export * from './cognito';
export * from './s3';

export type AppConfigFunctionType = {
  cognito: () => CognitoConfigType;
  s3: () => S3ConfigType;
};

export type AppConfigType = CognitoConfigType;

export default { cognito, s3 };
