import { Test, TestingModule } from '@nestjs/testing';

import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NodemailerController } from './nodemailer.controller';
import { NodemailerService, QUEUE_EMAIL } from './nodemailer.service';

describe('NodemailerController', () => {
    let controller: NodemailerController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
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
                        } as MailerOptions),
                }),
                BullModule.registerQueue({
                    name: QUEUE_EMAIL,
                }),
            ],
            controllers: [NodemailerController],
            providers: [NodemailerService],
        }).compile();

        controller = module.get<NodemailerController>(NodemailerController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
