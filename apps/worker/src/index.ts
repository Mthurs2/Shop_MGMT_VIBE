import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'worker' });

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

const worker = new Worker(
  'jobs',
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'processing job');
    return { success: true };
  },
  { connection }
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'job failed');
});
