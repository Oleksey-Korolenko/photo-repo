import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';
import { AppConfigService } from '@config/config.service';

const config = new AppConfigService().get('handler');

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
        authorizer: {
          name: config.authorizerName,
          arn: config.authorizerArn,
        },
      },
    },
  ],
};
