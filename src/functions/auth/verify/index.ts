import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'verify',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'auth/verify',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
