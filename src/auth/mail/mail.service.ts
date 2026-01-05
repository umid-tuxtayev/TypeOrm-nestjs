import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';


@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailer: MailerService) { }

    async sendOtp(email: string, otp: string): Promise<void> {
        try {
            await this.mailer.sendMail({
                to: email,
                subject: 'Tasdiqlash kodi',
                html: `
          <h2>OTP tasdiqlash</h2>
          <p>Kodingiz: <b>${otp}</b></p>
          <p>Kod 2 daqiqa amal qiladi.</p>
        `,
            });
        } catch (error) {
            this.logger.error('Email yuborishda xatolik', error);
            throw error;
        }
    }
}