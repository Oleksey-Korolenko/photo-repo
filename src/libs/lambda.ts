import { userMe } from '@functions/auth/me';
import { IResponse } from '@interface/response.interface';
import * as middy from 'middy';
import { httpErrorHandler, jsonBodyParser } from 'middy/middlewares';
import { formatJSONResponse } from './apiGateway';
import { ILambdaEvent } from './interface';

export const middyfyForJSON = (handler, hasToken: boolean) => {
  const preparedHandler = middy(handler);

  preparedHandler.use(jsonBodyParser());
  preparedHandler.use(httpErrorHandler());

  if (hasToken) {
    preparedHandler.use({
      before: async (
        handler: middy.HandlerLambda<ILambdaEvent>,
        next: middy.NextFunction
      ) => {
        const response = await userMe(handler.event.headers.Authorization);
        if ({}.hasOwnProperty.call(response, 'Username')) {
          next();
        } else {
          throw new Error();
        }
      },
      onError: (
        handler: middy.HandlerLambda<ILambdaEvent>,
        next: middy.NextFunction
      ) => {
        handler.response = formatJSONResponse<IResponse<string>>({
          statusCode: 403,
          response: 'Unauthorized!',
        });
        return next();
      },
    });
  }

  return preparedHandler;
};
