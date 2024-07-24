import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserQuestService } from 'src/user-quest/user-quest.service';
import { UserUpgradeService } from 'src/user-upgrade/user-upgrade.service';
import { Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { DailyBonusService } from '../daily-bonus/daily-bonus.service';
import { ReferralService } from '../referral/referral.service';
import { UsernamesService } from '../usernames/usernames.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usernamesService: UsernamesService,
    private balanceService: BalanceService,
    private dailyBonusService: DailyBonusService,
    private referralService: ReferralService,
    private userQuestService: UserQuestService,
    private userUpgradeService: UserUpgradeService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(telegram_id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { telegram_id } });
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
    return savedUser;
  }

  async delete(telegram_id: number): Promise<void> {
    await this.userRepository.delete({ telegram_id });
  }

  async initUser(
    telegram_id: number,
    username: string,
    ref_id?: number | null,
    is_premium?: boolean,
    locale?: string, // добавляем параметр locale
  ): Promise<User> {
    const existingUser = await this.findOne(telegram_id);
    const award = is_premium ? 100000 : 20000;

    if (existingUser) {
      return existingUser;
    }

    if (!username || username.trim() === '') {
      throw new HttpException(
        { error: 'Username is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const newUser = this.userRepository.create({
          telegram_id,
          registered_at: new Date(),
          status: 'active',
          locale,
        });
        await transactionalEntityManager.save(newUser);

        await this.usernamesService.create(telegram_id, username);

        if (ref_id) {
          await this.referralService.addReferral(
            ref_id,
            telegram_id,
            is_premium,
          ); // Изменен порядок
          await this.balanceService.increaseBalance(telegram_id, award);
        } else {
          await this.balanceService.increaseBalance(telegram_id, 0);
        }

        await this.dailyBonusService.createDailyBonus(telegram_id);
      },
    );

    return this.findOne(telegram_id);
  }

  async getUserStats(telegram_id: number): Promise<any> {
    const user = await this.findOne(telegram_id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const balance = await this.balanceService.findOne(telegram_id);
    const userUpgrades = await this.userUpgradeService.findAll(telegram_id); // Изменено на findAll
    const userQuests = await this.userQuestService.findOne(telegram_id);
    const dailyBonus = await this.dailyBonusService.findOne(telegram_id);

    return {
      user,
      balance: balance ? balance.balance : 0,
      upgrades: userUpgrades,
      quests: userQuests ? userQuests.quests : [],
      daily_streak: dailyBonus ? dailyBonus.daily_streak : 0,
    };
  }

  async changeLocale(telegram_id: number, locale: string): Promise<User> {
    const user = await this.findOne(telegram_id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.locale = locale;
    await this.userRepository.save(user);
    return user;
  }
}
