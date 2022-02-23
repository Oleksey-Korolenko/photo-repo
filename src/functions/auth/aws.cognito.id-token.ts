import AWSCognitoJwtToken from './aws.cognito.jwt-token';
import { IAuthenticationResult } from './interface';

export default class AWSCognitoIdToken extends AWSCognitoJwtToken {
  constructor(authenticationResult: IAuthenticationResult = undefined) {
    super(authenticationResult?.IdToken || '');
  }
}
