import 'source-map-support/register';
import { AWSCognitoConfig } from '../aws.cognito.config';
import { IGetUserResponseBody } from '../interface';

export const userMe = (token: string): Promise<string | boolean> => {
  const cognitoConfig = new AWSCognitoConfig();
  return new Promise(async (resolve) => {
    cognitoConfig.initAWS();
    const response = await cognitoConfig.getUserPool().getUser(token);

    if (!{}.hasOwnProperty.call(response, 'Username')) {
      return resolve(false);
    }

    let sub = '';

    (response as IGetUserResponseBody).UserAttributes.forEach((it) =>
      it.Name === 'sub' ? (sub = it.Value) : null
    );

    if (sub === '') {
      return resolve(false);
    } else {
      return resolve(sub);
    }
  });
};
