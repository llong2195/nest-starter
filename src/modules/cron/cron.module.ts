import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [CronService],
})
export class CronModule {}
