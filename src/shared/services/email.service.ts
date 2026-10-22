import nodemailer, { Transporter } from 'nodemailer';

import { env } from '@config/env';
import { logger } from '@config/logger';

type EmailPayload = {
  html?: string;
  subject: string;
  text: string;
  to: string;
};

export class EmailService {
  private transporter?: Transporter;

  isConfigured() {
    return Boolean(env.SMTP_HOST && env.SMTP_PORT && this.fromAddress());
  }

  async sendMail(payload: EmailPayload) {
    if (!this.isConfigured()) {
      logger.warn('Email notification skipped because SMTP is not configured', {
        subject: payload.subject,
        to: payload.to
      });
      return;
    }

    await this.getTransporter().sendMail({
      from: this.fromAddress(),
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: payload.to
    });
  }

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        auth: env.SMTP_USER
          ? {
              pass: env.SMTP_PASS,
              user: env.SMTP_USER
            }
          : undefined,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465
      });
    }

    return this.transporter;
  }

  private fromAddress() {
    const fromEmail = env.SMTP_FROM_EMAIL ?? env.SMTP_FROM;
    if (!fromEmail) return undefined;

    return env.SMTP_FROM_NAME ? `"${env.SMTP_FROM_NAME}" <${fromEmail}>` : fromEmail;
  }
}
