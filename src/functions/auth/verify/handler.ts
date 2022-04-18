import 'source-map-support/register';
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';

const verify = (email: string, code: string) => {
  return new Promise(async (resolve) => {
    const cognitoConfig = new AWSCognitoConfig();
    const result = await cognitoConfig
      .getCognitoUser(email)
      .confirmRegistration(code, true);

    if ({}.hasOwnProperty.call(result, '__type')) {
      return resolve({ statusCode: 422, response: result });
    }

    return resolve({ statusCode: 400, response: result });
  });
};

const notPreparedHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, code } = event.body;
  const response = await verify(email, code);
  return formatJSONResponse(response);
};

export const handler = middyfyForJSON(notPreparedHandler, false);
