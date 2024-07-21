import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AfkFarmService } from '../afk-farm/afk-farm.service';
import { BalanceService } from '../balance/balance.service';

@Injectable()
export class BalanceUpdateService {
  constructor(
    private readonly afkFarmService: AfkFarmService,
    private readonly balanceService: BalanceService,
  ) {}

  @Cron('*/5 * * * * *') // Запуск задачи каждые 5 секунд
  async handleCron() {
    const afkFarms = await this.afkFarmService.findAll();

    const now = new Date();
    const EIGHT_HOURS = 8 * 60 * 60 * 1000; // 8 часов в миллисекундах

    for (const afkFarm of afkFarms) {
      const afkStartTime = new Date(afkFarm.afk_start_time);
      const elapsedTime = now.getTime() - afkStartTime.getTime();

      if (elapsedTime > EIGHT_HOURS || afkFarm.coins_per_hour === 0) {
        continue; // Пропустить начисление если прошло больше 8 часов или coins_per_hour равно нулю
      }

      const incomePerSecond = afkFarm.coins_per_hour / 3600;
      const incomeEarned = incomePerSecond * (elapsedTime / 1000);

      await this.balanceService.increaseBalance(
        afkFarm.telegram_id,
        incomeEarned,
      );
    }
  }
}
