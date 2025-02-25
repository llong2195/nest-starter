import { Inject } from '@nestjs/common';

import { IORedisKey } from './redis.constants';

export const InjectRedis = () => Inject(IORedisKey);
