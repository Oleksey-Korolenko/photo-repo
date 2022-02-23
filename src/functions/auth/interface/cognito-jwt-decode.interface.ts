export interface ICognitoJWTDecodeResult {
  email: string;
  exp: number;
  auth_time: number;
  token_use: string;
  sub: string;
}

export interface IToken {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}
