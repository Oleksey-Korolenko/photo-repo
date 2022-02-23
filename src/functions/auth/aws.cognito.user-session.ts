import AWSCognitoAccessToken from './aws.cognito.access-token';
import AWSCognitoIdToken from './aws.cognito.id-token';
import AWSCognitoRefreshToken from './aws.cognito.refresh-token';

export default class AWSCognitoUserSession {
  #idToken: AWSCognitoIdToken;
  #refreshToken: AWSCognitoRefreshToken;
  #accessToken: AWSCognitoAccessToken;
  #clockDrift: number;

  constructor(
    IdToken: AWSCognitoIdToken,
    AccessToken: AWSCognitoAccessToken,
    RefreshToken: AWSCognitoRefreshToken,
    ClockDrift?: number
  ) {
    if (AccessToken == null || IdToken == null) {
      throw new Error('Id token and Access Token must be present.');
    }

    this.#idToken = IdToken;
    this.#refreshToken = RefreshToken;
    this.#accessToken = AccessToken;
    this.#clockDrift =
      ClockDrift === undefined ? this.calculateClockDrift() : ClockDrift;
  }

  getIdToken = (): AWSCognitoIdToken => {
    return this.#idToken;
  };

  getRefreshToken = (): AWSCognitoRefreshToken => {
    return this.#refreshToken;
  };

  getAccessToken = (): AWSCognitoAccessToken => {
    return this.#accessToken;
  };

  getClockDrift = (): number => {
    return this.#clockDrift;
  };

  calculateClockDrift = (): number => {
    const now = Math.floor(new Date().getTime() / 1000);
    const iat = Math.min(
      this.#accessToken.getIssuedAt(),
      this.#idToken.getIssuedAt()
    );

    return now - iat;
  };

  isValid = (): boolean => {
    const now = Math.floor(new Date().getTime() / 1000);
    const adjusted = now - this.#clockDrift;

    return (
      adjusted < this.#accessToken.getExpiration() &&
      adjusted < this.#idToken.getExpiration()
    );
  };
}
