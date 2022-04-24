import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IErrorHandlerResponse, ISignInHandlerResponse } from '../interface';
import { IResponse } from '@interface/response.interface';

const verify = (
  email: string,
  code: string,
  password: string
): Promise<IResponse<ISignInHandlerResponse | string>> => {
  return new Promise(async (resolve) => {
    const cognitoConfig = new AWSCognitoConfig();
    const verify = await cognitoConfig
      .getCognitoUser(email)
      .confirmRegistration(code, true);

    if ({}.hasOwnProperty.call(verify, '__type')) {
      const { message } = verify as IErrorHandlerResponse;

      return resolve({ statusCode: 422, response: message });
    }

    const response = await cognitoConfig
      .getCognitoUser(email)
      .authenticateUser(cognitoConfig.getAuthDetails(email, password));

    if (typeof response === 'string') {
      return resolve({
        statusCode: 200,
        response:
          'User email confirmed successfully, but something went wrong in login process!',
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
  const { email, code, password } = event.body;
  const response = await verify(email, code, password);
  return formatJSONResponse<IResponse<ISignInHandlerResponse | string>>(
    response
  );
};

export const handler = middyfyForJSON(notPreparedHandler, false);
