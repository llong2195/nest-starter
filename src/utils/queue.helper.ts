import { Queue, QueueOptions } from 'bullmq';
import { pathToFileURL } from 'node:url';

import { RedisComponent } from '@/common/shared/redis.component';
import { Logger, LogLevel } from '@nestjs/common';

const logger = new Logger('QUEUE');
const logLevel = process.env.LOG_LEVEL || 'error,warn';
logger.localInstance.setLogLevels?.(logLevel.split(',') as LogLevel[]);

/**
 * Converts a file path to the appropriate format for BullMQ sandboxed processors based on the platform.
 * On Windows platforms, converts the path to a file URL. On other platforms, returns the path as-is.
 *
 * @param path - The file path to be converted
 * @returns The converted path as a string or URL, suitable for BullMQ sandboxed processor configuration
 * @see {@link https://docs.bullmq.io/guide/workers/sandboxed-processors|BullMQ Sandboxed Processors Documentation}
 */
export const getPathConfigSandbox = (path: string) => {
  const platform = process.platform;
  // https://docs.bullmq.io/guide/workers/sandboxed-processors
  if (platform == 'win32') {
    return pathToFileURL(path);
  }
  return path;
};

/**
 * Generates configuration options for a Redis-based queue.
 *
 * @returns {QueueOptions} Queue configuration object containing:
 * - Redis connection client
 * - Default job options with removeOnComplete set to 5000
 *
 * @remarks
 * Uses environment variable REDIS_QUEUE_DB (defaults to '1') to determine Redis database number.
 * Relies on RedisComponent singleton for client management.
 */
export const getConfigQueue = () => {
  const REDIS_QUEUE_DB = Number(process.env.REDIS_QUEUE_DB || '1');
  const redisClient = RedisComponent.getInstance(REDIS_QUEUE_DB).getClient();
  const configQueue: QueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
      removeOnComplete: 5000,
    },
  };
  return configQueue;
};

/**
 * Debugs the queue status by logging job counts if there are active or waiting jobs
 * @param queue - The Bull queue instance to check
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * const myQueue = new Queue('myQueueName');
 * await debugQueueMsg(myQueue);
 * ```
 */
export const debugQueueMsg = async (queue: Queue) => {
  const jobCount = await queue.getJobCounts();
  if (jobCount.active + jobCount.waiting > 0) {
    logger.debug(
      `The scheduled job ${queue.name} has already been running!`,
      jobCount,
    );
  }
};
