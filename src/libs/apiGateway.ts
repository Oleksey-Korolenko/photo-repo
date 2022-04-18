import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';
import { ILambdaEvent } from './interface';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export type ValidatedEventAPIGatewayProxyEventWithUser<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S> & ILambdaEvent,
  APIGatewayProxyResult
>;

export const formatJSONResponse = <T>(response: T) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
