import { emailQueue } from '../queues/emailQueue';
import { prisma } from '../config/db';
import { EmailJobData } from '../workers/emailWorker';

export interface ScheduleEmailInput {
  userId: string;
  sender: string;
  recipients: string[];
  subject: string;
  body: string;
  scheduledAt: Date;
  delayBetweenEmailsMs?: number; // ms between each recipient
}

export async function scheduleEmails(input: ScheduleEmailInput) {
  const jobs = [];
  const { delayBetweenEmailsMs = 2000 } = input;

  // Ensure user record exists in DB to prevent foreign key constraint failure
  await prisma.user.upsert({
    where: { id: input.userId },
    update: {},
    create: {
      id: input.userId,
      googleId: input.userId,
      email: input.sender,
      name: 'User',
    },
  });

  for (let i = 0; i < input.recipients.length; i++) {
    const recipient = input.recipients[i];

    // Save to DB first
    const dbJob = await prisma.emailJob.create({
      data: {
        userId: input.userId,
        sender: input.sender,
        recipient,
        subject: input.subject,
        body: input.body,
        status: 'SCHEDULED',
        scheduledAt: input.scheduledAt,
      },
    });

    // Calculate staggered delay: base delay + per-recipient offset
    const baseDelay = Math.max(0, input.scheduledAt.getTime() - Date.now());
    const staggeredDelay = baseDelay + i * delayBetweenEmailsMs;

    // Add to BullMQ with delay
    const bullJob = await emailQueue.add(
      'send-email',
      {
        emailJobId: dbJob.id,
        sender: input.sender,
        recipient,
        subject: input.subject,
        body: input.body,
      } as EmailJobData,
      {
        delay: staggeredDelay,
        jobId: `email-${dbJob.id}`, // Unique jobId prevents duplicates
      }
    );

    // Store bullJobId back in DB
    await prisma.emailJob.update({
      where: { id: dbJob.id },
      data: { bullJobId: bullJob.id },
    });

    jobs.push({ dbJobId: dbJob.id, bullJobId: bullJob.id, recipient });
  }

  return jobs;
}
