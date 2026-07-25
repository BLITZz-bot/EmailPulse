import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export async function getMailTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  try {
    // Try dynamic Ethereal test account first
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
    console.log('✅ Ethereal SMTP provisioned | User:', testAccount.user);
    return transporter;
  } catch {
    // Verified fallback Ethereal account credentials
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'hwbe2kkwkefsjy7b@ethereal.email',
        pass: '8DYn938yj243D1QejC',
      },
    });
    console.log('✅ Ethereal SMTP fallback connected');
    return transporter;
  }
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

  // Extract Ethereal test message preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (!previewUrl) {
    throw new Error('Failed to obtain Ethereal preview URL');
  }

  console.log(`📧 Email sent to ${options.to} | Preview: ${previewUrl}`);
  return previewUrl as string;
}
