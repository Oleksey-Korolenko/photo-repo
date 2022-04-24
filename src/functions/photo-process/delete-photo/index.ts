import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';

export default {
  name: 'delete-photo',
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'delete',
        path: 's3/delete-photo',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
