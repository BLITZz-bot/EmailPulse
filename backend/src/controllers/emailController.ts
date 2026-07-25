import { Request, Response } from 'express';
import { z } from 'zod';
import { scheduleEmails } from '../services/schedulerService';
import { prisma } from '../config/db';
import { emailQueue } from '../queues/emailQueue';

const ScheduleSchema = z.object({
  sender: z.string().email(),
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  scheduledAt: z.string().datetime(),
  delayBetweenEmailsMs: z.number().optional(),
});

export async function scheduleEmailsHandler(req: Request, res: Response) {
  try {
    const parsed = ScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { sender, recipients, subject, body, scheduledAt, delayBetweenEmailsMs } = parsed.data;
    const userId = (req as any).user?.id || 'demo-user-id'; // Fallback for dev testing

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const jobs = await scheduleEmails({
      userId,
      sender,
      recipients,
      subject,
      body,
      scheduledAt: new Date(scheduledAt),
      delayBetweenEmailsMs,
    });

    return res.status(201).json({ message: 'Emails scheduled', count: jobs.length, jobs });
  } catch (err) {
    console.error('scheduleEmailsHandler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getScheduledEmailsHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id || 'demo-user-id';
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const emails = await prisma.emailJob.findMany({
    where: { userId, status: { in: ['SCHEDULED', 'PROCESSING'] } },
    orderBy: { scheduledAt: 'asc' },
  });

  return res.json(emails);
}

export async function getSentEmailsHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id || 'demo-user-id';
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const emails = await prisma.emailJob.findMany({
    where: { userId, status: { in: ['SENT', 'FAILED'] } },
    orderBy: { sentAt: 'desc' },
  });

  return res.json(emails);
}

export async function cancelEmailHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id || 'demo-user-id';
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.params.id as string;
  const job = await prisma.emailJob.findFirst({ where: { id, userId } });

  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Can only cancel SCHEDULED jobs' });
  }

  // Remove from BullMQ
  if (job.bullJobId) {
    const bullJob = await emailQueue.getJob(job.bullJobId);
    if (bullJob) await bullJob.remove();
  }

  // Update DB
  await prisma.emailJob.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return res.json({ message: 'Job cancelled' });
}

export async function getStatsHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id || 'demo-user-id';
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const [scheduled, sent, failed] = await Promise.all([
    prisma.emailJob.count({ where: { userId, status: 'SCHEDULED' } }),
    prisma.emailJob.count({ where: { userId, status: 'SENT' } }),
    prisma.emailJob.count({ where: { userId, status: 'FAILED' } }),
  ]);

  return res.json({ scheduled, sent, failed, total: scheduled + sent + failed });
}
