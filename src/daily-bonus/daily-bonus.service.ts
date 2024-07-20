import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyBonus } from './daily-bonus.entity';

@Injectable()
export class DailyBonusService {
  constructor(
    @InjectRepository(DailyBonus)
    private dailyBonusRepository: Repository<DailyBonus>,
  ) {}

  async findOne(telegram_id: number): Promise<DailyBonus> {
    return this.dailyBonusRepository.findOne({ where: { telegram_id } });
  }

  async updateDailyStreak(
    telegram_id: number,
    reward_claimed_today: boolean,
  ): Promise<DailyBonus> {
    let dailyBonus = await this.dailyBonusRepository.findOne({
      where: { telegram_id },
    });
    if (!dailyBonus) {
      dailyBonus = this.dailyBonusRepository.create({
        telegram_id,
        daily_streak: 1,
        reward_claimed_today,
      });
    } else {
      dailyBonus.daily_streak = reward_claimed_today
        ? dailyBonus.daily_streak + 1
        : 1;
      dailyBonus.reward_claimed_today = reward_claimed_today;
    }
    return this.dailyBonusRepository.save(dailyBonus);
  }
}
