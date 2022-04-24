import 'source-map-support/register';
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEventWithUser,
} from '@libs/apiGateway';
import { middyfyForJSON } from '@libs/lambda';
import schema from './schema';
import { IResponse } from '@interface/response.interface';
import { AWSS3Config } from '../aws.s3.config';
import { IS3DeleteResponse } from '../interface';

const deletePhoto = (
  userKey: string,
  photoId: string
): Promise<IResponse<IS3DeleteResponse>> => {
  return new Promise(async (resolve) => {
    const s3Config = new AWSS3Config();
    const response = await s3Config.delete(userKey, photoId);

    if (response === true) {
      return resolve({
        statusCode: 200,
        response: {
          isCorrect: true,
          message: `Photo ${photoId} successfully deleted!`,
        },
      });
    } else {
      return resolve({
        statusCode: 400,
        response: {
          isCorrect: false,
          message: 'Something went wrong!',
        },
      });
    }
  });
};

const notPreparedHandler: ValidatedEventAPIGatewayProxyEventWithUser<
  typeof schema
> = async (event) => {
  const response = await deletePhoto(event.userKey, event.body.photoId);
  return formatJSONResponse<IResponse<IS3DeleteResponse>>(response);
};

export const handler = middyfyForJSON(notPreparedHandler, true);
