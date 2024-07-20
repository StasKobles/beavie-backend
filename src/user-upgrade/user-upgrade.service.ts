import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpgrade } from './user-upgrade.entity';

@Injectable()
export class UserUpgradeService {
  constructor(
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
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
    return this.userUpgradeRepository.save(userUpgrade);
  }
}
