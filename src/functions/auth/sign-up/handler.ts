import 'source-map-support/register';
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IResponse } from '@interface/response.interface';
import { ISignUpHandlerResponse } from '../interface';

const signUp = async (
  email: string,
  password: string
): Promise<IResponse<ISignUpHandlerResponse>> => {
  const cognitoConfig = new AWSCognitoConfig();
  return new Promise(async (resolve) => {
    cognitoConfig.initAWS();
    cognitoConfig.setCognitoAttributeList(email);
    const result = await cognitoConfig
      .getUserPool()
      .signUp(email, password, cognitoConfig.getCognitoAttributeList());

    return resolve({
      statusCode: 201,
      response: { userConfirmed: result.UserConfirmed },
    });
  });
};

const notPreparedHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, password } = event.body;
  const response = await signUp(email, password);
  return formatJSONResponse<ISignUpHandlerResponse>(response);
};

export const handler = middyfy(notPreparedHandler);
