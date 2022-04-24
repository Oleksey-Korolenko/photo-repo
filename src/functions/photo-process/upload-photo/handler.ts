import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEventWithUser,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { IResponse } from '@interface/response.interface';
import { AWSS3Config } from '../aws.s3.config';
import { IS3UploadResponse } from '../interface';

const upload = (
  base64Image: string,
  userKey: string
): Promise<IResponse<IS3UploadResponse>> => {
  return new Promise(async (resolve) => {
    const s3Config = new AWSS3Config();
    const response = await s3Config.upload(base64Image, userKey);
    return resolve({
      statusCode: 200,
      response,
    });
  });
};

const notPreparedHandler: ValidatedEventAPIGatewayProxyEventWithUser<
  typeof schema
> = async (event) => {
  const response = await upload(event.body.base64Image, event.userKey);
  return formatJSONResponse<IResponse<IS3UploadResponse>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, true);
