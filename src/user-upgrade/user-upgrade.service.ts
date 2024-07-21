import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpgrade } from './user-upgrade.entity';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { AfkFarmService } from 'src/afk-farm/afk-farm.service';
import { BalanceService } from 'src/balance/balance.service';

@Injectable()
export class UserUpgradeService {
  constructor(
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
    private balanceService: BalanceService,
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
    // Найти существующее улучшение
    const upgrade = await this.upgradeRepository.findOne({
      where: { upgrade_id },
    });
    if (!upgrade) {
      throw new HttpException('Upgrade not found', HttpStatus.NOT_FOUND);
    }

    // Найти или создать запись улучшений пользователя
    let userUpgrade = await this.userUpgradeRepository.findOne({
      where: { telegram_id },
    });
    let currentLevel = 0;
    if (!userUpgrade) {
      userUpgrade = this.userUpgradeRepository.create({
        telegram_id,
        upgrades: [{ upgrade_id, level }],
      });
    } else {
      const existingUpgrade = userUpgrade.upgrades.find(
        (u) => u.upgrade_id === upgrade_id,
      );
      if (existingUpgrade) {
        currentLevel = existingUpgrade.level;
        existingUpgrade.level = level;
      } else {
        userUpgrade.upgrades.push({ upgrade_id, level });
      }
    }

    // Рассчитать общую стоимость улучшения от текущего уровня до желаемого уровня
    let totalCost = 0;
    for (let lvl = currentLevel + 1; lvl <= level; lvl++) {
      totalCost +=
        upgrade.base_cost * Math.pow(upgrade.upgrade_factor, lvl - 1);
    }

    // Найти пользователя и проверить его баланс
    const userBalance = await this.balanceService.findOne(telegram_id);
    if (!userBalance || userBalance.balance < totalCost) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    // Снять стоимость улучшения с баланса пользователя
    await this.balanceService.deductBalance(telegram_id, totalCost);

    // Сохранить обновленную информацию об улучшениях пользователя
    const savedUserUpgrade = await this.userUpgradeRepository.save(userUpgrade);

    // Обновить доход AFK фарминга
    await this.updateAfkFarmIncome(telegram_id);

    return savedUserUpgrade;
  }

  // Метод для обновления дохода AFK фарминга
  private async updateAfkFarmIncome(telegram_id: number): Promise<void> {
    const userUpgrades = await this.userUpgradeRepository.findOne({
      where: { telegram_id },
    });

    if (!userUpgrades) {
      return;
    }

    const upgrades = userUpgrades.upgrades;
    let totalIncomePerHour = 0;

    for (const upgrade of upgrades) {
      const upgradeDetails = await this.upgradeRepository.findOne({
        where: { upgrade_id: upgrade.upgrade_id },
      });
      if (upgradeDetails) {
        totalIncomePerHour +=
          upgradeDetails.base_income *
          Math.pow(upgradeDetails.upgrade_factor, upgrade.level - 1);
      }
    }

    // Преобразование дохода в час в целое число
    const totalIncomePerHourInt = Math.floor(totalIncomePerHour);

    await this.afkFarmService.updateAfkFarm({
      telegram_id,
      coins_per_hour: totalIncomePerHourInt,
      afk_start_time: new Date(),
    });
  }
}
