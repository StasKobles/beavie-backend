import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DailyBonusService } from './daily-bonus.service';

@Injectable()
export class DailyBonusScheduler {
  constructor(private readonly dailyBonusService: DailyBonusService) {}

  @Cron('0 0 * * *') // Запускается каждый день в полночь
  async handleCron() {
    console.log('Running daily bonus update task');
    await this.dailyBonusService.resetDailyStreaks();
  }
}
