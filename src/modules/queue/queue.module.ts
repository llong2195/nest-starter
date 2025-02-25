import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QueueController } from './queue.controller';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            username: configService.get<string>('REDIS_USERNAME'),
            password: configService.get<string>('REDIS_PASSWORD'),
          },
        };
      },
    }),

    BullModule.registerQueue({
      name: 'default',
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, QueueProcessor],
})
export class QueueModule {}
