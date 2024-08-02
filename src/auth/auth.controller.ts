import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Req() req) {
    const user = await this.authService.validateUser(req.body.initDataRaw);
    return this.authService.login(user);
  }
}
