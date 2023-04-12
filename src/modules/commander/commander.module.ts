import { appConfig, authConfig, databaseConfig } from '@configs/index';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@src/database/database.module';

import { UserCommander } from './user.commander';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [appConfig, databaseConfig, authConfig],
        }),
        DatabaseModule,
    ],
    controllers: [],
    providers: [UserCommander],
})
export class CommanderModule {}
