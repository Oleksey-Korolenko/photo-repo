import { ICognitoAttribute } from './cognito-config.interface';

export interface IRespondToAuthChallengeResponseBody {
  AuthenticationResult: IAuthenticationResult;
}

export interface IAuthenticationResult {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string;
}

export interface IInitiateAuthResponseBody {
  ChallengeName: string;
  ChallengeParameters: IInitiateAuthChallengeParameters;
}

export interface IInitiateAuthChallengeParameters {
  SALT: string;
  SECRET_BLOCK: string;
  SRP_B: string;
  USERNAME: string;
  USER_ID_FOR_SRP: string;
}

export interface ISignUpResponseBody {
  UserConfirmed: boolean;
}

export interface IGetUserResponseBody {
  UserAttributes: ICognitoAttribute[];
  Username: string;
}
