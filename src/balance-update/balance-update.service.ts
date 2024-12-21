import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../user/user.service';

@Injectable()
export class BalanceUpdateService {
  constructor(private readonly userService: UserService) {}

  @Cron('*/5 * * * * *') // Запуск задачи каждые 5 секунд
  async handleCron() {
    const afkFarms = await this.userService.findAllAfkFarms();

    const now = new Date();
    const EIGHT_HOURS = 8 * 60 * 60 * 1000; // 8 часов в миллисекундах

    for (const afkFarm of afkFarms) {
      const afkStartTime = new Date(afkFarm.afk_start_time);
      const elapsedTime = now.getTime() - afkStartTime.getTime();

      // Проверяем, прошло ли больше 8 часов с начала AFK
      if (elapsedTime > EIGHT_HOURS || afkFarm.coins_per_hour === 0) {
        continue; // Пропустить начисление если прошло больше 8 часов или coins_per_hour равно нулю
      }

      // Начисляем доход за 5 секунд
      const incomePerSecond = afkFarm.coins_per_hour / 3600;
      const incomeEarned = incomePerSecond * 5; // Начисляем доход за 5 секунд

      await this.userService.increaseBalance(
        afkFarm.user.telegram_id,
        incomeEarned,
      );
    }
  }
}
