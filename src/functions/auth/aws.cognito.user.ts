import { BigInteger } from '@libs/bigInteger';
import DateHelper from '@libs/dateHelper';
import MemoryStorage from '@libs/storageHelper';
import AWSCognitoAuthHelper from './aws.cognito.auth-helper';
import { AWSCognitoClientService } from './aws.cognito.client';
import { AWSCognitoUserPoolService } from './aws.cognito.user-pool';
import { HmacSHA256, enc, lib } from 'crypto-js';
import { Buffer } from 'buffer';
import AWSCognitoIdToken from './aws.cognito.id-token';
import AWSCognitoAccessToken from './aws.cognito.access-token';
import AWSCognitoRefreshToken from './aws.cognito.refresh-token';
import AWSCognitoUserSession from './aws.cognito.user-session';
import {
  IAuthenticationResult,
  IConfirmSignUpRequestBody,
  IErrorHandlerResponse,
  IInitiateAuthRequestBody,
  IInitiateAuthResponseBody,
  IRespondToAuthChallengeRequestBody,
  IRespondToAuthChallengeResponseBody,
} from './interface';

export default class AWSCognitoUser {
  #username: string;
  #pool: AWSCognitoUserPoolService;
  #authenticationFlowType: string;
  #client: AWSCognitoClientService;
  #storage: MemoryStorage;

  #deviceKey: string;

  #signInUserSession: AWSCognitoUserSession;

  constructor(data) {
    if (data == null || data.Username == null || data.Pool == null) {
      throw new Error('Username and Pool information are required.');
    }

    this.#username = data.Username || '';
    this.#pool = data.Pool;
    this.#client = data.Pool.getClient();
    this.#authenticationFlowType = 'USER_SRP_AUTH';
    this.#storage = new MemoryStorage();
  }

  public authenticateUser = async (
    authDetails
  ): Promise<AWSCognitoUserSession> => {
    let serverBValue;
    let salt;

    const AuthHelper = new AWSCognitoAuthHelper(
      this.#pool.getUserPoolId().split('_')[1]
    );

    const data = await this.#client.request<
      IInitiateAuthRequestBody,
      IInitiateAuthResponseBody
    >('InitiateAuth', {
      AuthFlow: this.#authenticationFlowType,
      ClientId: this.#pool.getClientId(),
      AuthParameters: {
        USERNAME: this.#username,
        SECRET_HASH: this.#pool.getClientSecret(this.#username),
        SRP_A: AuthHelper.getLargeAValue().toString(16),
        DEVICE_KEY: this.#deviceKey != null ? this.#deviceKey : undefined,
      },
    });

    const challengeParameters = data.ChallengeParameters;

    this.#username = challengeParameters.USER_ID_FOR_SRP;
    serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
    salt = new BigInteger(challengeParameters.SALT, 16);

    this.#getCachedDeviceKeyAndPassword();

    const hkdf = AuthHelper.getPasswordAuthenticationKey(
      this.#username,
      authDetails.Password,
      serverBValue,
      salt
    );

    const dateNow = DateHelper.getNowString();

    const message = lib.WordArray.create(
      Buffer.concat([
        Buffer.from(this.#pool.getUserPoolId().split('_')[1], 'utf8'),
        Buffer.from(this.#username, 'utf8'),
        Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'),
        Buffer.from(dateNow, 'utf8'),
      ]) as unknown as number[]
    );

    const key = lib.WordArray.create(hkdf as unknown as number[]);
    const signatureString = enc.Base64.stringify(HmacSHA256(message, key));

    const dataAuthenticate = await this.#client.request<
      IRespondToAuthChallengeRequestBody,
      IRespondToAuthChallengeResponseBody
    >('RespondToAuthChallenge', {
      ChallengeName: 'PASSWORD_VERIFIER',
      ClientId: this.#pool.getClientId(),
      ChallengeResponses: {
        USERNAME: this.#username,
        PASSWORD_CLAIM_SECRET_BLOCK: challengeParameters.SECRET_BLOCK,
        TIMESTAMP: dateNow,
        PASSWORD_CLAIM_SIGNATURE: signatureString,
        SECRET_HASH: this.#pool.getClientSecret(this.#username),
        DEVICE_KEY: this.#deviceKey != null ? this.#deviceKey : undefined,
      },
    });

    return this.#authenticateUserInternal(dataAuthenticate);
  };

  #authenticateUserInternal = (
    dataAuthenticate: IRespondToAuthChallengeResponseBody
  ): AWSCognitoUserSession => {
    this.#signInUserSession = this.#getCognitoUserSession(
      dataAuthenticate.AuthenticationResult
    );
    this.#cacheTokens();

    return this.#signInUserSession;
  };

  #cacheTokens = (): void => {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.#pool.getClientId()}`;
    const idTokenKey = `${keyPrefix}.${this.#username}.idToken`;
    const accessTokenKey = `${keyPrefix}.${this.#username}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.${this.#username}.refreshToken`;
    const clockDriftKey = `${keyPrefix}.${this.#username}.clockDrift`;
    const lastUserKey = `${keyPrefix}.LastAuthUser`;

    this.#storage.setItem(
      idTokenKey,
      this.#signInUserSession.getIdToken().getJwtToken()
    );
    this.#storage.setItem(
      accessTokenKey,
      this.#signInUserSession.getAccessToken().getJwtToken()
    );
    this.#storage.setItem(
      refreshTokenKey,
      this.#signInUserSession.getRefreshToken().getToken()
    );
    this.#storage.setItem(
      clockDriftKey,
      `${this.#signInUserSession.getClockDrift()}`
    );
    this.#storage.setItem(lastUserKey, this.#username);
  };

  #getCognitoUserSession = (
    authResult: IAuthenticationResult
  ): AWSCognitoUserSession => {
    const idToken = new AWSCognitoIdToken(authResult);
    const accessToken = new AWSCognitoAccessToken(authResult);
    const refreshToken = new AWSCognitoRefreshToken(authResult);

    return new AWSCognitoUserSession(idToken, accessToken, refreshToken);
  };

  #getCachedDeviceKeyAndPassword = (): void => {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.#pool.getClientId()}.${
      this.#username
    }`;
    const deviceKeyKey = `${keyPrefix}.deviceKey`;

    if (this.#storage.getItem(deviceKeyKey)) {
      this.#deviceKey = this.#storage.getItem(deviceKeyKey);
    }
  };

  confirmRegistration = (
    confirmationCode: string,
    forceAliasCreation
  ): Promise<{} | IErrorHandlerResponse> => {
    const jsonReq = {
      ClientId: this.#pool.getClientId(),
      SecretHash: this.#pool.getClientSecret(this.#username),
      ConfirmationCode: confirmationCode,
      Username: this.#username,
      ForceAliasCreation: forceAliasCreation,
    };
    return this.#client.request<
      IConfirmSignUpRequestBody,
      {} | IErrorHandlerResponse
    >('ConfirmSignUp', jsonReq);
  };
}
