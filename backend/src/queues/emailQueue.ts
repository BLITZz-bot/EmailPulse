import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const EMAIL_QUEUE_NAME = 'email-scheduler';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,          // retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 5000,        // 5s, 10s, 20s
    },
    removeOnComplete: false, // keep job record for audit
    removeOnFail: false,
  },
});

console.log('✅ Email queue initialized');
