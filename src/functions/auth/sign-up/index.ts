import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'sign-up',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'auth/sign-up',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
