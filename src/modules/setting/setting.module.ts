import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingEntity } from '@entities/setting.entity';

import { SettingController } from './setting.controller';
import { SettingRepository } from './setting.repository';
import { SettingService } from './setting.service';

@Module({
    imports: [TypeOrmModule.forFeature([SettingEntity])],
    controllers: [SettingController],
    providers: [SettingService, SettingRepository],
})
export class SettingModule {}
