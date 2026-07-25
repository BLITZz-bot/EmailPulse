export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface EmailJob {
  id: string;
  userId: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  etherealPreview?: string;
  createdAt: string;
}

export interface User {
  id: string;
  googleId?: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Stats {
  scheduled: number;
  sent: number;
  failed: number;
  total: number;
}
