import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';
import { AppConfigService } from '@config/config.service';

const config = new AppConfigService().get('handler');

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
        authorizer: {
          name: config.authorizerName,
          arn: config.authorizerArn,
        },
      },
    },
  ],
};
