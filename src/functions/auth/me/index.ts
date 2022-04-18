import 'source-map-support/register';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IGetUserResponseBody } from '../interface';

export const userMe = (token: string): Promise<string> => {
  const cognitoConfig = new AWSCognitoConfig();
  return new Promise(async (resolve, reject) => {
    cognitoConfig.initAWS();
    const response = await cognitoConfig.getUserPool().getUser(token);

    if (!{}.hasOwnProperty.call(response, 'Username')) {
      reject();
    }

    (response as IGetUserResponseBody).UserAttributes.forEach((it) =>
      it.Name === 'sub' ? resolve(it.Value) : null
    );

    reject();
  });
};
