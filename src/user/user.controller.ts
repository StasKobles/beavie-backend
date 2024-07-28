import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a new user' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        ref_id: 987654321,
        username: 'example_user',
        is_premium: true,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User initialized successfully',
    type: User,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async initUser(
    @Body()
    data: {
      telegram_id: number;
      ref_id?: number | null;
      username: string;
      is_premium?: boolean;
      locale?: string;
    },
  ): Promise<{ user: User; isNew: boolean }> {
    try {
      return await this.userService.initUser(
        data.telegram_id,
        data.username,
        data.ref_id,
        data.is_premium,
        data.locale,
      );
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/:telegram_id')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(@Param('telegram_id') telegram_id: number): Promise<any> {
    return this.userService.getUserStats(telegram_id);
  }

  @Post('change-locale')
  @ApiOperation({ summary: 'Change the locale of a user' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        locale: 'ru',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Locale changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeLocale(
    @Body() data: { telegram_id: number; locale: string },
  ): Promise<User> {
    try {
      return await this.userService.changeLocale(data.telegram_id, data.locale);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
