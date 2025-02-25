import { SettingEntity } from '@/database/pg/entities/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity])],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
