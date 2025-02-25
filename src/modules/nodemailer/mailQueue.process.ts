import { Job } from 'bullmq';

import { QueueEnum } from '@/common/enums/queue.enum';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { NodemailerService } from './nodemailer.service';

@Processor(QueueEnum.EMAIL_QUEUE)
export class MailQueueProcessor extends WorkerHost {
  constructor(private readonly nodemailer: NodemailerService) {
    super();
  }

  @OnWorkerEvent('completed')
  onCompleted(res: { jobId: string; returnvalue: string; prev?: string }) {
    console.log('🚀 ~ MailQueueProcessor ~ res:', res);
  }

  async process(job: Job, token?: string) {
    await this.nodemailer.example();
  }
}
