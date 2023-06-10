import { join } from 'path';

import { HttpModule } from '@nestjs/axios';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { appConfig, authConfig, databaseConfig } from '@configs/index';
import { EnvEnum } from '@enums/index';
import { AuthModule } from '@modules/auth/auth.module';
import { CommanderModule } from '@modules/commander/commander.module';
import { CronModule } from '@modules/cron/cron.module';
import { FileModule } from '@modules/file/file.module';
import { NodemailerModule } from '@modules/nodemailer/nodemailer.module';
import { QrCodeModule } from '@modules/qr-code/qr-code.module';
import { QueueModule } from '@modules/queue/queue.module';
import { SettingModule } from '@modules/setting/setting.module';
import { UserModule } from '@modules/user/user.module';
import { isEnv } from '@utils/index';
import { ValidatorsModule } from '@validators/validators.module';

import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AllExceptionFilter } from './filter/exception.filter';
import { ThrottlerBehindProxyGuard } from './guard/throttler-behind-proxy.guard';
import { I18nModule } from './i18n/i18n.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response.transform.interceptor';
import { LoggerModule } from './logger/logger.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

const providers = [] as Provider[];

if (isEnv(EnvEnum.Production)) {
    providers.push({
        provide: APP_GUARD,
        useClass: ThrottlerBehindProxyGuard,
    });
} else {
    providers.push({
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
    });
}
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [appConfig, databaseConfig, authConfig],
        }),

        DevtoolsModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                http: config.get<string>('NODE_ENV') !== EnvEnum.Production,
                port: config.get<number>('port'),
            }),
        }),

        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../', '/public'),
            serveRoot: '/',
            exclude: ['/api/*', '/auth/*'],
        }),

        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                ({
                    ttl: config.get<number>('THROTTLE_TTL'),
                    limit: config.get<number>('THROTTLE_LIMIT'),
                } as ThrottlerModuleOptions),
        }),

        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                ({
                    redis: {
                        host: config.get<string>('REDIS_HOST'),
                        port: config.get<number>('REDIS_PORT'),
                    },
                    defaultJobOptions: {
                        removeOnComplete: true,
                        attempts: 10,
                    },
                } as BullRootModuleOptions),
        }),

        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                timeout: configService.get('HTTP_TIMEOUT'),
                maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
            }),
            inject: [ConfigService],
        }),

        LoggerModule,
        I18nModule,
        DatabaseModule,
        ValidatorsModule,
        SettingModule,
        CronModule,
        AuthModule,
        UserModule,
        FileModule,
        NodemailerModule,
        QueueModule,
        CommanderModule,
        QrCodeModule,
        // IORedisModule.registerAsync({
        //     imports: [ConfigModule],
        //     useFactory: async (configService: ConfigService): Promise<IRedisModuleOptions> => {
        //         return {
        //             connectionOptions: {
        //                 host: configService.get('REDIS_HOST'),
        //                 port: configService.get('REDIS_PORT'),
        //                 password: configService.get('REDIS_PASS'),
        //             },
        //             onClientReady: (client: Redis) => {
        //                 client.on('connect', () => {
        //                     LoggerService.log(
        //                         `Connected to redis on ${client.options.host}:${client.options.port}`,
        //                         IORedisModule.name,
        //                     );
        //                 });
        //             },
        //         };
        //     },
        //     inject: [ConfigService],
        // }),
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseTransformInterceptor,
        },
        ...providers,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        // consumer.apply(RawBodyMiddleware).forRoutes({
        //     path: 'webhook/stripe',
        //     method: RequestMethod.POST,
        // });
    }
}
