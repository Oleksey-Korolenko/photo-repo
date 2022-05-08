import * as AWS from 'aws-sdk';
import { AppConfigService, CognitoConfigType } from 'src/config';
import {
  ICognitoAttribute,
  ISignInHandlerResponse,
  IHandlerResponseWrapper,
  ISignUpHandlerResponse,
} from './interface';
import * as crypto from 'crypto';

export class AWSCognitoConfig {
  #cognitoAttributeList: ICognitoAttribute[];
  #cognitoConfig: CognitoConfigType;
  #cognitoServiceProvider: AWS.CognitoIdentityServiceProvider;

  constructor() {
    this.#cognitoAttributeList = [];
    this.#cognitoConfig = new AppConfigService().get('cognito');
    this.#cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
  }

  public signUp = async (
    email: string,
    password: string
  ): Promise<IHandlerResponseWrapper<ISignUpHandlerResponse>> => {
    try {
      this.#setCognitoAttributeList(email);

      const result = await this.#cognitoServiceProvider
        .signUp({
          ClientId: this.#cognitoConfig.ClientId,
          SecretHash: this.#getClientSecret(email),
          UserAttributes: this.#getCognitoAttributeList(),
          Username: email,
          Password: password,
        })
        .promise();

      return {
        statusCode: 201,
        data: { UserConfirmed: result.UserConfirmed },
      };
    } catch (e) {
      return {
        statusCode: 404,
        data: e.message,
      };
    }
  };

  public confirmSignUp = async (
    email: string,
    password: string,
    code: string
  ): Promise<IHandlerResponseWrapper<ISignInHandlerResponse>> => {
    try {
      await this.#cognitoServiceProvider
        .confirmSignUp({
          ClientId: this.#cognitoConfig.ClientId,
          SecretHash: this.#getClientSecret(email),
          ConfirmationCode: code,
          Username: email,
          ForceAliasCreation: true,
        })
        .promise();

      return await this.initiateAuth(email, password);
    } catch (e) {
      return {
        statusCode: 404,
        data: e.message,
      };
    }
  };

  public initiateAuth = async (
    email: string,
    password: string
  ): Promise<IHandlerResponseWrapper<ISignInHandlerResponse>> => {
    try {
      const loginResult = await this.#cognitoServiceProvider
        .initiateAuth({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: this.#cognitoConfig.ClientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: this.#getClientSecret(email),
          },
        })
        .promise();

      return {
        statusCode: 200,
        data: {
          accessToken: loginResult.AuthenticationResult.AccessToken,
          idToken: loginResult.AuthenticationResult.IdToken,
          refreshToken: loginResult.AuthenticationResult.RefreshToken,
        },
      };
    } catch (e) {
      return {
        statusCode: 404,
        data: e.message,
      };
    }
  };

  public getUser = async (token: string): Promise<string | boolean> => {
    try {
      const meResult = await this.#cognitoServiceProvider
        .getUser({
          AccessToken: token.replace('Bearer ', ''),
        })
        .promise();

      let sub = '';

      meResult.UserAttributes.forEach((it) =>
        it.Name === 'sub' ? (sub = it.Value) : null
      );

      if (sub === '') {
        return false;
      } else {
        return sub;
      }
    } catch (e) {
      return false;
    }
  };

  #getClientSecret = (username: string): string => {
    return crypto
      .createHmac('SHA256', this.#cognitoConfig.ClientSecret)
      .update(username + this.#cognitoConfig.ClientId)
      .digest('base64');
  };

  #setCognitoAttributeList = (email: string): void => {
    this.#cognitoAttributeList.push(this.#attributes('email', email));
  };

  #getCognitoAttributeList = (): ICognitoAttribute[] => {
    return this.#cognitoAttributeList;
  };

  #attributes = (key: string, value: string): ICognitoAttribute => {
    return {
      Name: key,
      Value: value,
    };
  };
}
