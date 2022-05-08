export type CognitoConfigType = {
  ClientId: string;
  ClientSecret: string;
};

const cognito = (): CognitoConfigType => ({
  ClientId:
    process.env.AWS_COGNITO_CLIENT_ID === undefined
      ? ''
      : process.env.AWS_COGNITO_CLIENT_ID,
  ClientSecret:
    process.env.AWS_COGNITO_CLIENT_SECRET === undefined
      ? ''
      : process.env.AWS_COGNITO_CLIENT_SECRET,
});

export default cognito;
