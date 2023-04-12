import IORedis from 'ioredis';

import { DynamicModule, Global, Logger, Module } from '@nestjs/common';

import type { RedisAsyncModuleOptions } from './redis.interface';

export const IORedisKey = 'IOREDIS_MODULES_KEY';

@Global()
@Module({})
export class IORedisModule {
    static async registerAsync({ useFactory, imports, inject }: RedisAsyncModuleOptions): Promise<DynamicModule> {
        const redisProvider = {
            provide: IORedisKey,
            useFactory: async (...args: any) => {
                const { connectionOptions, onClientReady } = await useFactory(...args);

                const client = new IORedis(connectionOptions);
                onClientReady(client);
                client.on('error', err => {
                    Logger.error(err, IORedisModule.name);
                });
                return client;
            },
            inject,
        };

        return {
            module: IORedisModule,
            imports,
            providers: [redisProvider],
            exports: [redisProvider],
        };
    }
}
