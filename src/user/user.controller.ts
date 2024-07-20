import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('init')
  async initUser(
    @Body()
    data: {
      telegram_id: number;
      ref_id: number | null;
      username: string;
      is_premium: boolean;
    },
  ): Promise<User> {
    try {
      return await this.userService.initUser(
        data.telegram_id,
        data.ref_id,
        data.username,
        data.is_premium,
      );
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
