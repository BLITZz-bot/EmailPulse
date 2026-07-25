import nodemailer from 'nodemailer';

export async function getMailTransporter(): Promise<nodemailer.Transporter> {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
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

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`📧 Email sent to ${options.to} | Preview: ${previewUrl}`);
  return previewUrl as string;
}
