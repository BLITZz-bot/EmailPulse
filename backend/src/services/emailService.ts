import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export async function getMailTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  // Auto-provision Ethereal test account
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('✅ Ethereal SMTP ready | User:', testAccount.user);
  return transporter;
}

export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const mailer = await getMailTransporter();

  const info = await mailer.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  // Ethereal gives you a preview URL to see the email in browser
  const previewUrl = nodemailer.getTestMessageUrl(info) as string;
  console.log(`📧 Email sent to ${options.to} | Preview: ${previewUrl}`);
  return previewUrl;
}
