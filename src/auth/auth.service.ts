import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { validate, parse } from '@telegram-apps/init-data-node';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(initDataRaw: string): Promise<any> {
    try {
      validate(initDataRaw, process.env.BOT_TOKEN, { expiresIn: 3600 });
      const userData = parse(initDataRaw);
      const user = await this.userService.findOne(userData.user.id);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid init data');
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.telegram_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
