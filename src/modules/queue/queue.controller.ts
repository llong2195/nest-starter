import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QueueService } from './queue.service';

@ApiTags('v1/queue')
@Controller({ version: '1', path: 'queue' })
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Post('transcode')
  async transcode() {
    await this.queueService.transcode();
  }
}
