import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import IORedis from 'ioredis';

import type { RedisAsyncModuleOptions } from './redis.interface';

export const IORedisKey = '__IOREDIS_MODULES_KEY__';

@Global()
@Module({})
export class IORedisModule {
    static async registerAsync({ useFactory, imports, inject }: RedisAsyncModuleOptions): Promise<DynamicModule> {
        const redisProvider = {
            provide: IORedisKey,
            useFactory: async (...args: any) => {
                const { connectionOptions, onClientReady } = await useFactory(...args);

                const client = new IORedis(connectionOptions);
                if (typeof onClientReady == 'function') {
                    onClientReady(client);
                }
                client.on('connect', () => {
                    Logger.log(
                        `Connected to redis on ${client.options.host}:${client.options.port}`,
                        IORedisModule.name,
                    );
                });
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
