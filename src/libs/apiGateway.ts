import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';
import { ILambdaEvent } from './interface';

type ValidatedBodyAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  'body'
> & {
  body: FromSchema<S>;
};

export type ValidatedEventBodyAPIGatewayProxyEvent<S> = Handler<
  ValidatedBodyAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export type ValidatedEventBodyAPIGatewayProxyEventWithUser<S> = Handler<
  ValidatedBodyAPIGatewayProxyEvent<S> & ILambdaEvent,
  APIGatewayProxyResult
>;

export const formatJSONResponse = <T>(response: T) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
