import EQueryCode from '@query/enum/query.enum';
import { IQueryAttributes } from '@query/interface';
import QueryService from '@query/query.service';

export class AWSCognitoClientService {
  #endpoint: string;
  #queryService: QueryService;

  constructor(region) {
    this.#endpoint = `cognito-idp.${region}.amazonaws.com`;
    this.#queryService = new QueryService();
  }

  request = async <BODY, RESP>(
    operation: string,
    params: BODY
  ): Promise<RESP> => {
    const headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
      'X-Amz-User-Agent': 'aws-amplify/5.0.4 js',
    };

    const options = Object.assign(
      {},
      {
        hostname: this.#endpoint,
        path: '',
        headers,
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
      }
    ) as IQueryAttributes<typeof headers>;

    const result = await this.#queryService.sendRequest<
      typeof headers,
      RESP,
      BODY
    >(options, undefined, params);

    if (result.code !== EQueryCode.OK) {
      throw new Error(result.message);
    } else {
      return result.data;
    }
  };
}
