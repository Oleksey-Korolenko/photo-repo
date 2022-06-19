export type HandlerConfigType = {
  authorizerName: string;
  authorizerArn: string;
};

const handler = (): HandlerConfigType => ({
  authorizerName:
    process.env.AWS_AUTHORIZER_NAME === undefined
      ? ''
      : process.env.AWS_AUTHORIZER_NAME,
  authorizerArn:
    process.env.AWS_AUTHORIZER_ARN === undefined
      ? ''
      : process.env.AWS_AUTHORIZER_ARN,
});

export default handler;
