import { ICognitoAttribute } from '.';

export interface IConfirmSignUpRequestBody {
  ClientId: string;
  ConfirmationCode: string;
  ForceAliasCreation: boolean;
  SecretHash: string;
  Username: string;
}

export interface IInitiateAuthRequestBody {
  AuthFlow: string;
  AuthParameters: IInitiateAuthParameters;
  ClientId: string;
}

interface IInitiateAuthParameters {
  USERNAME: string;
  SECRET_HASH: string;
  SRP_A: string;
  DEVICE_KEY?: string;
}

export interface IRespondToAuthChallengeRequestBody {
  ChallengeName: string;
  ClientId: string;
  ChallengeResponses: IChallengeResponses;
}

interface IChallengeResponses {
  USERNAME: string;
  PASSWORD_CLAIM_SECRET_BLOCK: string;
  TIMESTAMP: string;
  PASSWORD_CLAIM_SIGNATURE: string;
  SECRET_HASH: string;
  DEVICE_KEY?: string;
}

export interface ISignUpRequestBody {
  ClientId: string;
  SecretHash: string;
  Username: string;
  Password: string;
  UserAttributes: ICognitoAttribute[];
}

export interface IMeRequestBody {
  AccessToken: string;
}
