import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secureConnection: false,
      auth: {
        user: this.configService.get<string>('email.server'),
        pass: this.configService.get<string>('email.password'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
    cc?: string | string[],
    bcc?: string | string[],
    attachments?: any,
  ) {
    try {
      const res = await this.transporter.sendMail({
        from: `SmartBarber <${this.configService.get<string>('email.sender')}>`,
        to,
        subject,
        cc,
        bcc,
        attachments,
        html,
      });

      console.log('Email sent:', res.response);
      return res;
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }
}
