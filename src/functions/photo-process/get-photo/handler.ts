import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventBodyAPIGatewayProxyEventWithUser,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { IResponse } from '@interface/response.interface';
import { AWSS3Config } from '../aws.s3.config';
import { IS3GetResponse } from '../interface';

const getPhoto = (
  userKey: string,
  photoId: string
): Promise<IResponse<IS3GetResponse | string>> => {
  return new Promise(async (resolve) => {
    const s3Config = new AWSS3Config();
    const response = await s3Config.getObject(userKey, photoId);

    if (typeof response === 'string') {
      return resolve({
        statusCode: 404,
        response,
      });
    } else {
      return resolve({
        statusCode: 200,
        response,
      });
    }
  });
};

const notPreparedHandler: ValidatedEventBodyAPIGatewayProxyEventWithUser<
  typeof schema
> = async (event) => {
  const response = await getPhoto(event.userKey, event.body.photoId);
  return formatJSONResponse<IResponse<IS3GetResponse | string>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, true);
