import 'source-map-support/register';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IErrorHandlerResponse, IGetUserResponseBody } from '../interface';

export const userMe = (
  token: string
): Promise<IGetUserResponseBody | IErrorHandlerResponse> => {
  const cognitoConfig = new AWSCognitoConfig();
  return new Promise(async (resolve) => {
    cognitoConfig.initAWS();
    const response = await cognitoConfig.getUserPool().getUser(token);

    return resolve(response);
  });
};
