import { join } from 'node:path';

import { QueueEnum } from '@/common/enums/queue.enum';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MailQueueProcessor } from './mailQueue.process';
import { NodemailerController } from './nodemailer.controller';
import { NodemailerService } from './nodemailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ({
          transport: {
            host: config.get<string>('NODEMAILER_HOST'),
            secure: config.get<boolean>('NODEMAILER_SECURE'),
            port: config.get<number>('NODEMAILER_PORT') || 465,
            auth: {
              user: config.get<string>('NODEMAILER_USER'),
              pass: config.get<string>('NODEMAILER_PASS'),
            },
          },
          defaults: {
            from: `"No Reply" <no-reply@localhost>' <${config.get<string>('NODEMAILER_FROM')}>`,
          },
          preview: false, // true
          template: {
            dir: join(__dirname, './../../../public/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }) as MailerOptions,
    }),
    BullModule.registerQueue({
      name: QueueEnum.EMAIL_QUEUE,
    }),
  ],
  controllers: [NodemailerController],
  providers: [NodemailerService, MailQueueProcessor],
})
export class NodemailerModule {}
