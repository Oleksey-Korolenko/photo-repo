import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { ISignInHandlerResponse } from '../interface';
import { IResponse } from '@interface/response.interface';

const verify = async (
  email: string,
  code: string,
  password: string
): Promise<IResponse<ISignInHandlerResponse | string>> => {
  const cognitoConfig = new AWSCognitoConfig();

  const result = await cognitoConfig.confirmSignUp(email, password, code);

  return {
    statusCode: result.statusCode,
    response: result.data,
  };
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
