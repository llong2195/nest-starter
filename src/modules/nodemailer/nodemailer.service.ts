import { Queue } from 'bull';

import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/logger/custom.logger';

export const QUEUE_EMAIL = 'QUEUE_EMAIL';
export const QUEUE_EMAIL_SENDMAIL = 'QUEUE_EMAIL_SENDMAIL';
@Injectable()
export class NodemailerService {
    constructor(
        private readonly mailerService: MailerService,
        @InjectQueue(QUEUE_EMAIL) private queueMail: Queue,
    ) {}

    public async example(): Promise<void> {
        this.mailerService
            .sendMail({
                to: 'email@gmail.com',
                from: 'noreply@nestjs.com',
                subject: 'Testing Nest Mailermodule with template ✔',
                template: 'welcome',
                context: {
                    // Data to be sent to template engine.
                },
            })
            .catch(e => {
                LoggerService.error(e);
            });
    }

    async sendMailwithQueue(data: string) {
        try {
            const job = await this.queueMail.add(QUEUE_EMAIL_SENDMAIL, {
                data: data,
            });
            console.log(job.id);
            return job.id;
        } catch (e) {
            LoggerService.error(e);
            throw e;
        }
    }
}
