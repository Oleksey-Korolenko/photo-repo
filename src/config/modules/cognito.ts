export type CognitoConfigType = {
  UserPoolId: string;
  ClientId: string;
  ClientSecret: string;
  region: string;
  identityPoolId: string;
};

const cognito = (): CognitoConfigType => ({
  UserPoolId:
    process.env.AWS_COGNITO_USER_POOL_ID === undefined
      ? ''
      : process.env.AWS_COGNITO_USER_POOL_ID,
  ClientId:
    process.env.AWS_COGNITO_CLIENT_ID === undefined
      ? ''
      : process.env.AWS_COGNITO_CLIENT_ID,
  ClientSecret:
    process.env.AWS_COGNITO_CLIENT_SECRET === undefined
      ? ''
      : process.env.AWS_COGNITO_CLIENT_SECRET,
  region:
    process.env.AWS_COGNITO_REGION === undefined
      ? ''
      : process.env.AWS_COGNITO_REGION,
  identityPoolId:
    process.env.AWS_COGNITO_IDENTITY_POOL_ID === undefined
      ? ''
      : process.env.AWS_COGNITO_IDENTITY_POOL_ID,
});

export default cognito;
