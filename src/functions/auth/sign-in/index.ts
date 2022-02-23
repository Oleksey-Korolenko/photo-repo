import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'sign-in',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'auth/sign-in',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
