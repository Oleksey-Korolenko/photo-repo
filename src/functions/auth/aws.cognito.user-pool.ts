import { AWSCognitoClientService } from './aws.cognito.client';
import * as crypto from 'crypto';
import {
  IErrorHandlerResponse,
  IGetUserResponseBody,
  IMeRequestBody,
  ISignUpRequestBody,
  ISignUpResponseBody,
} from './interface';

const USER_POOL_ID_MAX_LENGTH = 55;

export class AWSCognitoUserPoolService {
  #userPoolId: string;
  #clientId: string;
  #clientSecret: string;
  #client: AWSCognitoClientService;

  constructor(data) {
    const { UserPoolId, ClientId, ClientSecret } = data || {};
    if (!UserPoolId || !ClientId) {
      throw new Error('Both UserPoolId and ClientId are required.');
    }
    if (
      UserPoolId.length > USER_POOL_ID_MAX_LENGTH ||
      !/^[\w-]+_[0-9a-zA-Z]+$/.test(UserPoolId)
    ) {
      throw new Error('Invalid UserPoolId format.');
    }
    const region = UserPoolId.split('_')[0];

    this.#userPoolId = UserPoolId;
    this.#clientId = ClientId;
    this.#clientSecret = ClientSecret;

    this.#client = new AWSCognitoClientService(region);
  }

  getUserPoolId = (): string => {
    return this.#userPoolId;
  };

  getClientId = (): string => {
    return this.#clientId;
  };

  getClientSecret = (username: string): string => {
    return crypto
      .createHmac('SHA256', this.#clientSecret)
      .update(username + this.#clientId)
      .digest('base64');
  };

  getClient = (): AWSCognitoClientService => {
    return this.#client;
  };

  signUp = async (
    username,
    password,
    userAttributes
  ): Promise<ISignUpResponseBody> => {
    return this.#client.request<ISignUpRequestBody, ISignUpResponseBody>(
      'SignUp',
      {
        ClientId: this.#clientId,
        SecretHash: this.getClientSecret(username),
        Username: username,
        Password: password,
        UserAttributes: userAttributes,
      }
    );
  };

  getUser = async (
    token: string
  ): Promise<IGetUserResponseBody | IErrorHandlerResponse> =>
    this.#client.request<
      IMeRequestBody,
      IGetUserResponseBody | IErrorHandlerResponse
    >('GetUser', {
      AccessToken: token.replace('Bearer ', ''),
    });
}
