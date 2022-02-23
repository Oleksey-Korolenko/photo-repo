import AWSCognitoJwtToken from './aws.cognito.jwt-token';
import { IAuthenticationResult } from './interface';

export default class AWSCognitoAccessToken extends AWSCognitoJwtToken {
  constructor(authenticationResult: IAuthenticationResult = undefined) {
    super(authenticationResult?.AccessToken || '');
  }
}
