export interface ILambdaEvent {
  headers: ILambdaEventHaders;
  userKey: string;
  requestContext: ILambdaEventRequestContext;
}

interface ILambdaEventRequestContext {
  authorizer: ILambdaEventRequestContextAuthorizer;
}

interface ILambdaEventRequestContextAuthorizer {
  claims: ILambdaEventRequestContextAuthorizerClaims | undefined;
  scoppes: string[] | undefined;
  principalId: string;
}

interface ILambdaEventRequestContextAuthorizerClaims {
  sub: string;
}

interface ILambdaEventHaders {
  Authorization: string;
}
