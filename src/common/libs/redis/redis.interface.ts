import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import type { Redis, RedisOptions } from 'ioredis';

export interface IRedisModuleOptions {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
}

export type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<IRedisModuleOptions> | IRedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
