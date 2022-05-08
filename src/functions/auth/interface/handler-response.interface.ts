export interface ISignInHandlerResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface ISignUpHandlerResponse {
  UserConfirmed: boolean;
}

export interface IHandlerResponseWrapper<Data> {
  statusCode: number;
  data: Data | string;
}
