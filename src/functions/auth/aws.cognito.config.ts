import * as AWS from 'aws-sdk';
import { AppConfigService, CognitoConfigType } from 'src/config';
import { AWSCognitoUserPoolService } from './aws.cognito.user-pool';
import AWSCognitoUser from './aws.cognito.user';
import jwtDecode from 'jwt-decode';
import {
  ICognitoAttribute,
  ICognitoAuthDetails,
  ISignInHandlerResponse,
  ICognitoJWTDecodeResult,
  IToken,
} from './interface';

export class AWSCognitoConfig {
  #cognitoAttributeList: ICognitoAttribute[];
  #cognitoConfig: CognitoConfigType;

  constructor() {
    this.#cognitoAttributeList = [];
    this.#cognitoConfig = new AppConfigService().get('cognito');
  }

  #attributes = (key: string, value: string): ICognitoAttribute => {
    return {
      Name: key,
      Value: value,
    };
  };

  setCognitoAttributeList = (email: string): void => {
    const attributeList = [];
    attributeList.push(this.#attributes('email', email));
    attributeList.forEach((element) => {
      this.#cognitoAttributeList.push(element);
    });
  };

  getCognitoUser = (email: string): AWSCognitoUser => {
    const userData = {
      Username: email,
      Pool: this.getUserPool(),
    };
    return new AWSCognitoUser(userData);
  };

  getUserPool = (): AWSCognitoUserPoolService => {
    const poolData = {
      UserPoolId: this.#cognitoConfig.UserPoolId,
      ClientId: this.#cognitoConfig.ClientId,
      ClientSecret: this.#cognitoConfig.ClientSecret,
    };

    return new AWSCognitoUserPoolService(poolData);
  };

  getCognitoAttributeList = (): ICognitoAttribute[] => {
    return this.#cognitoAttributeList;
  };

  initAWS = (): void => {
    AWS.config.region = this.#cognitoConfig.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.#cognitoConfig.identityPoolId,
    });
  };

  getAuthDetails = (email: string, password: string): ICognitoAuthDetails => {
    return {
      Username: email,
      Password: password,
    };
  };

  decodeJWTToken = (token: IToken): ISignInHandlerResponse => {
    const { email, exp, auth_time, token_use, sub } =
      jwtDecode<ICognitoJWTDecodeResult>(token.idToken);
    return { token, email, exp, uid: sub, auth_time, token_use };
  };
}
