import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEvent,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IResponse } from '@interface/response.interface';
import { ISignUpHandlerResponse } from '../interface';

const signUp = async (
  email: string,
  password: string
): Promise<IResponse<ISignUpHandlerResponse | string>> => {
  const cognitoConfig = new AWSCognitoConfig();

  const result = await cognitoConfig.signUp(email, password);

  return {
    statusCode: result.statusCode,
    response: result.data,
  };
};

const notPreparedHandler: ValidatedEventBodyAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, password } = event.body;
  const response = await signUp(email, password);
  return formatJSONResponse<IResponse<ISignUpHandlerResponse | string>>(
    response
  );
};

export const handler = middyfyForJSON(notPreparedHandler, false);
