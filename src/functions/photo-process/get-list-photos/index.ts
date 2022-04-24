import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'get-list-photos',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 's3/get-list-photos',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
