import 'source-map-support/register';
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IResponse } from '@interface/response.interface';
import { ISignInHandlerResponse } from '../interface';

const signIn = (
  email: string,
  password: string
): Promise<IResponse<ISignInHandlerResponse>> => {
  return new Promise(async (resolve) => {
    const cognitoConfig = new AWSCognitoConfig();
    const result = await cognitoConfig
      .getCognitoUser(email)
      .authenticateUser(cognitoConfig.getAuthDetails(email, password));
    const token = {
      accessToken: result.getAccessToken().getJwtToken(),
      idToken: result.getIdToken().getJwtToken(),
      refreshToken: result.getRefreshToken().getToken(),
    };
    return resolve({
      statusCode: 200,
      response: cognitoConfig.decodeJWTToken(token),
    });
  });
};

const notPreparedHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, password } = event.body;
  const response = await signIn(email, password);
  return formatJSONResponse<IResponse<ISignInHandlerResponse>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, false);
