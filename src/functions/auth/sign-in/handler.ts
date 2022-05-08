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

const signIn = async (
  email: string,
  password: string
): Promise<IResponse<ISignInHandlerResponse | string>> => {
  const cognitoConfig = new AWSCognitoConfig();

  const result = await cognitoConfig.initiateAuth(email, password);

  return {
    statusCode: result.statusCode,
    response: result.data,
  };
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
