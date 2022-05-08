import 'source-map-support/register';
import { AWSCognitoConfig } from '../aws.cognito.config';

export const userMe = (token: string): Promise<string | boolean> => {
  const cognitoConfig = new AWSCognitoConfig();

  return cognitoConfig.getUser(token);
};
