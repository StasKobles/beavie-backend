import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyBonus } from './daily-bonus.entity';
import { BalanceService } from '../balance/balance.service';

@Injectable()
export class DailyBonusService {
  constructor(
    @InjectRepository(DailyBonus)
    private dailyBonusRepository: Repository<DailyBonus>,
    private balanceService: BalanceService, // Инжектим баланс сервис
  ) {}

  async findOne(telegram_id: number): Promise<DailyBonus> {
    return this.dailyBonusRepository.findOne({ where: { telegram_id } });
  }

  async updateDailyStreak(
    telegram_id: number,
  ): Promise<{ success: boolean; reward: number }> {
    const dailyBonus = await this.findOne(telegram_id);
    if (!dailyBonus) {
      throw new Error('Daily bonus record not found');
    }

    if (dailyBonus.reward_claimed_today) {
      throw new Error('Reward already claimed today');
    }

    const reward = this.calculateReward(dailyBonus.daily_streak);

    dailyBonus.reward_claimed_today = true;
    await this.dailyBonusRepository.save(dailyBonus);

    await this.balanceService.updateBalance(telegram_id, reward);

    return { success: true, reward };
  }

  calculateReward(daily_streak: number): number {
    switch (daily_streak) {
      case 0:
        return 500;
      case 1:
        return 1000;
      case 2:
        return 2000;
      case 3:
        return 5000;
      case 4:
        return 10000;
      case 5:
        return 50000;
      case 6:
        return 100000;
      default:
        return 500000;
    }
  }

  async createDailyBonus(telegram_id: number): Promise<DailyBonus> {
    const dailyBonus = this.dailyBonusRepository.create({
      telegram_id,
      daily_streak: 1,
      reward_claimed_today: false,
    });
    return this.dailyBonusRepository.save(dailyBonus);
  }

  async resetDailyStreaks(): Promise<void> {
    const users = await this.dailyBonusRepository.find();
    for (const user of users) {
      if (!user.reward_claimed_today) {
        user.daily_streak = 0;
      } else {
        user.daily_streak += 1;
      }
      user.reward_claimed_today = false;
      await this.dailyBonusRepository.save(user);
    }
  }
}
