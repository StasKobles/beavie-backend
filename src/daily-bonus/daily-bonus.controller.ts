import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { DailyBonusService } from './daily-bonus.service';

@Controller('daily-bonuses')
export class DailyBonusController {
  constructor(private readonly dailyBonusService: DailyBonusService) {}

  @Get(':telegram_id')
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
