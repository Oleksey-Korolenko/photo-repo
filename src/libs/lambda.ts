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
        handler: middy.HandlerLambda<ILambdaEvent>
      ): Promise<void> => {
        if (
          handler.event.requestContext.authorizer?.claims?.sub === undefined
        ) {
          throw Error();
        } else {
          handler.event.userKey =
            handler.event.requestContext.authorizer.claims.sub;
        }

        return Promise.resolve();
      },
      onError: (handler: middy.HandlerLambda<ILambdaEvent>): Promise<void> => {
        handler.response = formatJSONResponse<IResponse<string>>({
          statusCode: 403,
          response: 'Unauthorized!',
        });

        return Promise.resolve();
      },
    });
  }

  return preparedHandler;
};
