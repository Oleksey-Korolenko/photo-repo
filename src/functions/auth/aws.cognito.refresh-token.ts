import { IAuthenticationResult } from './interface';

export default class AWSCognitoRefreshToken {
  #token: string;

  constructor(authenticationResult: IAuthenticationResult = undefined) {
    this.#token = authenticationResult?.RefreshToken || '';
  }

  getToken = (): string => {
    return this.#token;
  };
}
