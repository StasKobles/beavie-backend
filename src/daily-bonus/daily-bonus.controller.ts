import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DailyBonusService } from './daily-bonus.service';
import { DailyBonus } from './daily-bonus.entity';

@Controller('daily-bonus')
export class DailyBonusController {
  constructor(private readonly dailyBonusService: DailyBonusService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<DailyBonus> {
    return this.dailyBonusService.findOne(telegram_id);
  }

  @Post()
  updateDailyStreak(
    @Body() data: { telegram_id: number; reward_claimed_today: boolean },
  ): Promise<DailyBonus> {
    return this.dailyBonusService.updateDailyStreak(
      data.telegram_id,
      data.reward_claimed_today,
    );
  }
}
