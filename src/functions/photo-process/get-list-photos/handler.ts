import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEventWithUser,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { IResponse } from '@interface/response.interface';
import { AWSS3Config } from '../aws.s3.config';
import { IS3GetListResponse } from '../interface';

const getListPhotos = (
  userKey: string,
  limit: number,
  startAfter?: string
): Promise<IResponse<IS3GetListResponse>> => {
  return new Promise(async (resolve) => {
    const s3Config = new AWSS3Config();
    const response = await s3Config.getListObjects(userKey, limit, startAfter);

    return resolve({
      statusCode: 200,
      response,
    });
  });
};

const notPreparedHandler: ValidatedEventBodyAPIGatewayProxyEventWithUser<
  typeof schema
> = async (event) => {
  const response = await getListPhotos(
    event.userKey,
    event.body.limit,
    event.body?.startAfter
  );
  return formatJSONResponse<IResponse<IS3GetListResponse>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, true);
