import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'create-presigned-post',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 's3/create-presigned-post',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
