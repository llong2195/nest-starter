import { Queue } from 'bullmq';

import { QueueEnum, TopicEnum } from '@/common/enums/queue.enum';
import { LoggerService } from '@/common/logger/custom.logger';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodemailerService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectQueue(QueueEnum.EMAIL_QUEUE) private queueMail: Queue,
    private readonly logger: LoggerService,
  ) {}

  async example(): Promise<void> {
    await this.mailerService
      .sendMail({
        to: 'email@gmail.com',
        from: 'noreply@gmail.com',
        subject: 'Testing Nest Mailermodule with template ✔',
        template: 'welcome',
        context: {
          // Data to be sent to template engine.
        },
      })
      .catch((e) => {
        this.logger.error(e);
      });
  }

  async sendMailwithQueue(data: string) {
    try {
      const job = await this.queueMail.add(TopicEnum.EMAIL_SENDMAIL, {
        data: data,
      });
      return job.id;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
