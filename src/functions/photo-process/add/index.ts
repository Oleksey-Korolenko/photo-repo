import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'upload',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 's3/upload',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
