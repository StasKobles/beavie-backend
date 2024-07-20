import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsernamesService } from '../usernames/usernames.service';
import { BalanceService } from '../balance/balance.service';
import { DailyBonusService } from '../daily-bonus/daily-bonus.service';
import { ReferralService } from '../referral/referral.service';
import { UserQuestService } from 'src/user-quest/user-quest.service';
import { UserUpgradeService } from 'src/user-upgrade/user-upgrade.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

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
    this.logger.log(`Found ${users.length} users`);
    return users;
  }

  async findOne(telegram_id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { telegram_id } });
    this.logger.log(`User ${telegram_id} found: ${!!user}`);
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`User created: ${savedUser.telegram_id}`);
    return savedUser;
  }

  async delete(telegram_id: number): Promise<void> {
    await this.userRepository.delete({ telegram_id });
    this.logger.log(`User deleted: ${telegram_id}`);
  }

  async initUser(
    telegram_id: number,
    ref_id: number | null,
    username: string,
    is_premium: boolean,
  ): Promise<User> {
    this.logger.log('Received initUser request:', {
      telegram_id,
      ref_id,
      username,
      is_premium,
    });

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
        });
        await transactionalEntityManager.save(newUser);

        await this.usernamesService.create(telegram_id, username);

        if (ref_id) {
          await this.referralService.addReferral(telegram_id, ref_id);
          await this.balanceService.updateBalance(telegram_id, award);
        } else {
          await this.balanceService.updateBalance(telegram_id, 0);
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
    const userUpgrades = await this.userUpgradeService.findOne(telegram_id);
    const userQuests = await this.userQuestService.findOne(telegram_id);
    const dailyBonus = await this.dailyBonusService.findOne(telegram_id);

    return {
      user,
      balance: balance ? balance.balance : 0,
      upgrades: userUpgrades ? userUpgrades.upgrades : [],
      quests: userQuests ? userQuests.quests : [],
      daily_streak: dailyBonus ? dailyBonus.daily_streak : 0,
    };
  }
}
