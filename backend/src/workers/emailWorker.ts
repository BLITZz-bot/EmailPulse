import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EMAIL_QUEUE_NAME } from '../queues/emailQueue';
import { sendEmail } from '../services/emailService';
import { checkAndIncrementRateLimit } from '../services/rateLimitService';
import { prisma } from '../config/db';
import { env } from '../config/env';

export interface EmailJobData {
  emailJobId: string; // PostgreSQL EmailJob.id — for idempotency
  sender: string;
  recipient: string;
  subject: string;
  body: string;
}

export function startEmailWorker() {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { emailJobId, sender, recipient, subject, body } = job.data;

      // --- IDEMPOTENCY CHECK ---
      const dbJob = await prisma.emailJob.findUnique({
        where: { id: emailJobId },
      });

      if (!dbJob) {
        console.warn(`⚠️ Job ${emailJobId} not found in DB. Skipping.`);
        return;
      }

      if (dbJob.status === 'SENT' || dbJob.status === 'CANCELLED') {
        console.log(`⏭️ Job ${emailJobId} already ${dbJob.status}. Skipping.`);
        return;
      }

      // --- RATE LIMIT CHECK ---
      const rateLimit = await checkAndIncrementRateLimit(sender);

      if (!rateLimit.allowed) {
        console.log(`🚦 Rate limit hit for ${sender}. Re-delaying by ${rateLimit.nextWindowMs}ms`);

        // Re-delay the job into the next hour window
        // We throw a special error to trigger a delayed retry
        await job.moveToDelayed(Date.now() + rateLimit.nextWindowMs + Math.random() * 5000);
        return;
      }

      // --- MARK AS PROCESSING ---
      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: { status: 'PROCESSING' },
      });

      // --- SEND EMAIL ---
      try {
        const previewUrl = await sendEmail({
          from: sender,
          to: recipient,
          subject,
          html: body,
        });

        // Mark SENT
        await prisma.emailJob.update({
          where: { id: emailJobId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            etherealPreview: previewUrl,
          },
        });

        console.log(`✅ Email sent: ${recipient}`);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);

        // Mark FAILED
        await prisma.emailJob.update({
          where: { id: emailJobId },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: errMsg,
          },
        });

        throw error; // Let BullMQ handle retry
      }
    },
    {
      connection: redisConnection,
      concurrency: env.WORKER_CONCURRENCY,
      limiter: {
        max: 1,                                  // max 1 job processed
        duration: env.MIN_DELAY_BETWEEN_SENDS_MS // per 2000ms window
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  console.log(`🚀 Email worker started | concurrency: ${env.WORKER_CONCURRENCY}`);
  return worker;
}
