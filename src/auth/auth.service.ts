import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
  validateInitData(initData: string, botToken: string): boolean {
    try {
      const vals = Object.fromEntries(new URLSearchParams(initData).entries());
      const hash = vals.hash;
      delete vals.hash;

      const dataCheckString = Object.keys(vals)
        .sort()
        .map((key) => `${key}=${decodeURIComponent(vals[key])}`)
        .join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return hmac === hash;
    } catch (error) {
      return false;
    }
  }

  extractUserData(initData: string) {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));
    const is_premium = user.is_premium || false;
    const locale = user.language_code || 'en';
    const username =
      `${user.first_name} ${user.last_name}`.trim() || 'unnamed user';
    const telegram_id = user.id;

    return { is_premium, locale, username, telegram_id };
  }
}
