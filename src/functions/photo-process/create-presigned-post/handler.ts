import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEventWithUser,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { IResponse } from '@interface/response.interface';
import { AWSS3Config } from '../aws.s3.config';
import { IS3PresignedPostResponse } from '../interface';

const createPresignedPost = (
  userKey: string
): Promise<IResponse<IS3PresignedPostResponse>> => {
  return new Promise(async (resolve) => {
    const s3Config = new AWSS3Config();
    const response = await s3Config.createPresignedPost(userKey);
    return resolve({
      statusCode: 200,
      response,
    });
  });
};

const notPreparedHandler: ValidatedEventBodyAPIGatewayProxyEventWithUser<
  typeof schema
> = async (event) => {
  const response = await createPresignedPost(event.userKey);
  return formatJSONResponse<IResponse<IS3PresignedPostResponse>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, true);
