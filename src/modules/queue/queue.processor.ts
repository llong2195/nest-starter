import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';

import { TRANSCODING_QUEUE } from './queue.service';

@Processor(TRANSCODING_QUEUE)
export class QueueProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job, token?: string) {
    console.log(job);
    return Promise.resolve();
  }
}
