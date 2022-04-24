import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IResponse } from '@interface/response.interface';
import { ISignInHandlerResponse } from '../interface';

const signIn = (
  email: string,
  password: string
): Promise<IResponse<ISignInHandlerResponse | string>> => {
  return new Promise(async (resolve) => {
    const cognitoConfig = new AWSCognitoConfig();
    const response = await cognitoConfig
      .getCognitoUser(email)
      .authenticateUser(cognitoConfig.getAuthDetails(email, password));

    if (typeof response === 'string') {
      return resolve({
        statusCode: 404,
        response,
      });
    }

    const token = {
      accessToken: response.getAccessToken().getJwtToken(),
      idToken: response.getIdToken().getJwtToken(),
      refreshToken: response.getRefreshToken().getToken(),
    };
    return resolve({
      statusCode: 200,
      response: cognitoConfig.decodeJWTToken(token),
    });
  });
};

const notPreparedHandler: ValidatedEventBodyAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, password } = event.body;
  const response = await signIn(email, password);
  return formatJSONResponse<IResponse<ISignInHandlerResponse | string>>(
    response
  );
};

export const handler = middyfyForJSON(notPreparedHandler, false);
