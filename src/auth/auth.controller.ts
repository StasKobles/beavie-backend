import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { initData: string }) {
    const botToken = process.env.BOT_TOKEN;
    const isValid = this.authService.validateInitData(body.initData, botToken);

    if (!isValid) {
      throw new BadRequestException('Invalid init data');
    }

    const user = this.extractUserFromInitData(body.initData);
    const jwt = this.authService.generateJwt(user);

    return { access_token: jwt };
  }

  private extractUserFromInitData(initData: string): any {
    const params = new URLSearchParams(initData);
    return {
      id: params.get('user_id'),
      username: params.get('username'),
    };
  }
}
