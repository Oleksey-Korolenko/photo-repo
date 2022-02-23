import cognito, { CognitoConfigType } from './cognito';

export * from './cognito';

export type AppConfigFunctionType = {
  cognito: () => CognitoConfigType;
};

export type AppConfigType = CognitoConfigType;

export default { cognito };
