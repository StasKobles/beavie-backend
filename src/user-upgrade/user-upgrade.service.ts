import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpgrade } from './user-upgrade.entity';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { AfkFarmService } from 'src/afk-farm/afk-farm.service';

@Injectable()
export class UserUpgradeService {
  constructor(
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
    private afkFarmService: AfkFarmService,
  ) {}

  async findOne(telegram_id: number): Promise<UserUpgrade> {
    return this.userUpgradeRepository.findOne({ where: { telegram_id } });
  }

  async upgradeUser(
    telegram_id: number,
    upgrade_id: number,
    level: number,
  ): Promise<UserUpgrade> {
    let userUpgrade = await this.userUpgradeRepository.findOne({
      where: { telegram_id },
    });
    if (!userUpgrade) {
      userUpgrade = this.userUpgradeRepository.create({
        telegram_id,
        upgrades: [{ upgrade_id, level }],
      });
    } else {
      const upgrade = userUpgrade.upgrades.find(
        (u) => u.upgrade_id === upgrade_id,
      );
      if (upgrade) {
        upgrade.level = level;
      } else {
        userUpgrade.upgrades.push({ upgrade_id, level });
      }
    }

    const savedUserUpgrade = await this.userUpgradeRepository.save(userUpgrade);
    await this.updateAfkFarmIncome(telegram_id);

    return savedUserUpgrade;
  }

  private async updateAfkFarmIncome(telegram_id: number): Promise<void> {
    // Получить все текущие улучшения пользователя
    const userUpgrades = await this.userUpgradeRepository.findOne({
      where: { telegram_id },
    });

    if (!userUpgrades) {
      return;
    }

    let totalIncomePerHour = 0;

    for (const upgrade of userUpgrades.upgrades) {
      const upgradeData = await this.upgradeRepository.findOne({
        where: { upgrade_id: upgrade.upgrade_id },
      });

      if (upgradeData) {
        const incomePerHour =
          upgradeData.base_income *
          Math.pow(upgradeData.upgrade_factor, upgrade.level - 1);
        totalIncomePerHour += incomePerHour;
      }
    }

    await this.afkFarmService.updateAfkFarm({
      telegram_id,
      coins_per_hour: totalIncomePerHour,
      afk_start_time: new Date(),
    });
  }
}
