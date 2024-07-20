import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DailyBonusService } from './daily-bonus.service';

@ApiTags('daily-bonuses')
@Controller('daily-bonuses')
export class DailyBonusController {
  constructor(private readonly dailyBonusService: DailyBonusService) {}

  @Get(':telegram_id')
  @ApiOperation({ summary: 'Get daily bonus status' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily bonus status retrieved',
    schema: {
      example: {
        daily_streak: 1,
        reward_claimed_today: false,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('telegram_id') telegram_id: number,
  ): Promise<{ daily_streak: number; reward_claimed_today: boolean }> {
    const dailyBonus = await this.dailyBonusService.findOne(telegram_id);
    if (dailyBonus) {
      return {
        daily_streak: dailyBonus.daily_streak,
        reward_claimed_today: dailyBonus.reward_claimed_today,
      };
    } else {
      return {
        daily_streak: 0,
        reward_claimed_today: false,
      };
    }
  }

  @Post('update')
  @ApiOperation({ summary: 'Update daily bonus streak' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Daily bonus updated',
    schema: {
      example: {
        success: true,
        reward: 1000,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async updateDailyStreak(
    @Body() data: { telegram_id: number },
  ): Promise<{ success: boolean; reward: number }> {
    try {
      return await this.dailyBonusService.updateDailyStreak(data.telegram_id);
    } catch (error) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
