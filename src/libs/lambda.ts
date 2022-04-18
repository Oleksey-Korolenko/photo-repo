import * as middy from 'middy';
import { jsonBodyParser } from 'middy/middlewares';

export const middyfyForJSON = (handler) => {
  const preparedHandler = middy(handler);

  preparedHandler.use(jsonBodyParser());

  return preparedHandler;
};
