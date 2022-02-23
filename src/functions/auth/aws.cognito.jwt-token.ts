import { Buffer } from 'buffer';

export default class AWSCognitoJwtToken {
  #jwtToken: string;
  #payload: {
    exp?: number;
    iat?: number;
  };

  constructor(token: string) {
    this.#jwtToken = token || '';
    this.#payload = this.decodePayload();
  }

  getJwtToken = (): string => {
    return this.#jwtToken;
  };

  getExpiration = (): number | undefined => {
    return this.#payload?.exp;
  };

  getIssuedAt = (): number | undefined => {
    return this.#payload?.iat;
  };

  decodePayload = ():
    | {
        exp: number;
        iat: number;
      }
    | {} => {
    const payload = this.#jwtToken.split('.')[1];
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    } catch (err) {
      return {};
    }
  };
}
