import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpgrade } from './user-upgrade.entity';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { AfkFarmService } from 'src/afk-farm/afk-farm.service';
import { BalanceService } from 'src/balance/balance.service';
import { User } from 'src/user/user.entity';

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

  async findOne(telegram_id: number): Promise<UserUpgrade[]> {
    return this.userUpgradeRepository.find({
      where: { user: { telegram_id } },
    });
  }

  async findAll(telegram_id: number): Promise<UserUpgrade[]> {
    return this.userUpgradeRepository.find({
      where: { user: { telegram_id } },
      relations: ['upgrade'],
    });
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
      where: { user: { telegram_id }, upgrade: { upgrade_id } },
    });

    let currentLevel = 0;
    if (userUpgrade) {
      currentLevel = userUpgrade.level;
      userUpgrade.level = level;
      userUpgrade.upgraded_at = new Date();
    } else {
      userUpgrade = this.userUpgradeRepository.create({
        user: { telegram_id } as User,
        upgrade,
        level,
        upgraded_at: new Date(),
      });
    }

    // Рассчитать общую стоимость улучшения от текущего уровня до желаемого уровня
    let totalCost = 0;
    const { start_cost, end_cost, levels } = upgrade;
    const costRatio = Math.pow(end_cost / start_cost, 1 / (levels - 1));

    for (let lvl = currentLevel + 1; lvl <= level; lvl++) {
      const cost = start_cost * Math.pow(costRatio, lvl - 1);
      totalCost += cost;
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
    const userUpgrades = await this.userUpgradeRepository.find({
      where: { user: { telegram_id } },
      relations: ['upgrade'],
    });

    if (!userUpgrades) {
      return;
    }

    let totalIncomePerHour = 0;

    for (const userUpgrade of userUpgrades) {
      const upgradeDetails = userUpgrade.upgrade;
      if (upgradeDetails) {
        const { start_income, end_income, levels } = upgradeDetails;
        const incomeRatio = Math.pow(
          end_income / start_income,
          1 / (levels - 1),
        );

        // Рассчитываем доход только для текущего уровня
        const currentIncome =
          start_income * Math.pow(incomeRatio, userUpgrade.level - 1);

        totalIncomePerHour += currentIncome;
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
