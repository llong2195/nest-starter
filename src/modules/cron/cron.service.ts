import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  private readonly logger = new Logger(CronService.name);

  // @Interval(1000000)
  handleInterval(): void {
    this.logger.debug('Called every 1000 seconds');
    this.schedulerRegistry.getCronJobs().forEach((job, key) => {
      console.log(`${key} - ${job.running}`);
      if (!job.running) {
        this.schedulerRegistry.deleteCronJob(key);
      }
    });
  }

  // @Cron(CronExpression.EVERY_10_MINUTES)
  // @Cron('0 */1 * * * *')
  handlerCronEvery10Minute() {
    this.logger.debug(`Cron run : 10 minute`);
  }
}
