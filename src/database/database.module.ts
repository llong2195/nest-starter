import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerService } from '@src/logger/custom.logger';
import { DbCustomLogger } from '@src/logger/db-cusstom.logger';
import { isDev } from '@utils/util';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
                type: configService.get<string>('DATABASE_CONNECTION') as any,
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get<string>('DATABASE_USERNAME'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_DB_NAME'),
                entities: [__dirname + './../entities/**.entity{.ts,.js}'],
                timezone: configService.get<string>('TIMEZONE'),
                synchronize: true,
                autoLoadEntities: true,
                logging: 'all',
                logger: isDev() ? 'advanced-console' : new DbCustomLogger(new LoggerService()),
                // ssl: {
                //   require: false,
                //   rejectUnauthorized: false,
                // },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
