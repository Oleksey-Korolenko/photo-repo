import { IToken } from '.';

export interface ISignInHandlerResponse {
  token: IToken;
  email: string;
  exp: number;
  auth_time: number;
  token_use: string;
  uid: string;
}

export interface ISignUpHandlerResponse {}

export interface IErrorHandlerResponse {
  __type: string;
  message: string;
}
