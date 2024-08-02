import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AfkFarm } from './entities/afk-farm.entity';
import { Balance } from './entities/balance.entity';
import { DailyBonus } from './entities/daily-bonus.entity';
import { Referral } from './entities/referral.entity';
import { UserQuest } from './entities/user-quest.entity';
import { UserUpgrade } from './entities/user-upgrade.entity';
import { Usernames } from './entities/usernames.entity';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { Quest } from 'src/quest/quest.entity';
import { UpdateAfkFarmDto, ReferralResponseDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(DailyBonus)
    private dailyBonusRepository: Repository<DailyBonus>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(UserQuest)
    private userQuestRepository: Repository<UserQuest>,
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
    @InjectRepository(AfkFarm)
    private afkFarmRepository: Repository<AfkFarm>,
    @InjectRepository(Usernames)
    private usernamesRepository: Repository<Usernames>,
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(telegram_id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { telegram_id },
      relations: [
        'referrals',
        'userUpgrades',
        'userQuests',
        'balances',
        'afkFarms',
        'dailyBonuses',
        'usernames',
      ],
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async delete(telegram_id: number): Promise<void> {
    await this.userRepository.delete({ telegram_id });
  }

  async initUser(
    telegram_id: number,
    username: string,
    ref_id?: number | null,
    is_premium?: boolean,
    locale?: string,
  ): Promise<{ user: User; isNew: boolean }> {
    const existingUser = await this.findOne(telegram_id);
    const award = is_premium ? 5000 : 750;

    if (existingUser) {
      return { user: existingUser, isNew: false };
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

        await this.createUsername(telegram_id, username);

        if (ref_id) {
          await this.addReferral(ref_id, telegram_id, is_premium);
          await this.increaseBalance(telegram_id, award);
        } else {
          await this.increaseBalance(telegram_id, 0);
        }

        await this.createDailyBonus(telegram_id);
        await this.updateAfkStartTime(telegram_id, new Date());
      },
    );

    const newUser = await this.findOne(telegram_id);
    return { user: newUser, isNew: true };
  }

  async getUserStats(telegram_id: number): Promise<any> {
    const user = await this.findOne(telegram_id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const balance = await this.findBalance(telegram_id);
    const userUpgrades = await this.findUserUpgrades(telegram_id);
    const userQuests = await this.findUserQuests(telegram_id);
    const dailyBonus = await this.findDailyBonus(telegram_id);
    const afkFarm = await this.findAfkFarm(telegram_id);

    return {
      user,
      balance: balance ? balance.balance : 0,
      upgrades: userUpgrades,
      quests: userQuests ? userQuests : [],
      daily_streak: dailyBonus ? dailyBonus.daily_streak : 0,
      afkStartTime: afkFarm ? afkFarm.afk_start_time : new Date(),
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

  // Usernames
  async createUsername(
    telegram_id: number,
    username: string,
  ): Promise<Usernames> {
    const newUsernames = this.usernamesRepository.create({
      telegram_id,
      username,
    });
    return this.usernamesRepository.save(newUsernames);
  }

  // Balance
  async findBalance(telegram_id: number): Promise<Balance> {
    return this.balanceRepository.findOne({ where: { telegram_id } });
  }

  async increaseBalance(telegram_id: number, amount: number): Promise<Balance> {
    let balance = await this.findBalance(telegram_id);
    if (!balance) {
      balance = this.balanceRepository.create({
        telegram_id,
        balance: amount,
      });
    } else {
      balance.balance = Number(balance.balance) + amount;
    }
    return this.balanceRepository.save(balance);
  }

  async deductBalance(telegram_id: number, amount: number): Promise<Balance> {
    const balance = await this.findBalance(telegram_id);
    if (!balance) {
      throw new HttpException(
        'User does not have a balance record',
        HttpStatus.NOT_FOUND,
      );
    } else if (balance.balance < amount) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    } else {
      balance.balance -= amount;
    }
    return this.balanceRepository.save(balance);
  }

  async getTopBalances(): Promise<any[]> {
    const topBalances = await this.balanceRepository.find({
      order: { balance: 'DESC' },
      take: 10,
    });

    const leaderBoard = await Promise.all(
      topBalances.map(async (balance, index) => {
        const username = await this.usernamesRepository.findOne({
          where: { telegram_id: balance.telegram_id },
        });
        return {
          rank: index + 1,
          telegram_id: balance.telegram_id,
          balance: balance.balance,
          username: username ? username.username : 'Unnamed User',
        };
      }),
    );

    return leaderBoard;
  }

  async getBalanceAndUpdateTime(telegram_id: number): Promise<Balance> {
    await this.updateAfkStartTime(telegram_id, new Date());

    return this.findBalance(telegram_id);
  }

  // Daily Bonus
  async findDailyBonus(telegram_id: number): Promise<DailyBonus> {
    return this.dailyBonusRepository.findOne({ where: { telegram_id } });
  }

  async createDailyBonus(telegram_id: number): Promise<DailyBonus> {
    const dailyBonus = this.dailyBonusRepository.create({
      telegram_id,
      daily_streak: 0,
      reward_claimed_today: false,
    });
    return this.dailyBonusRepository.save(dailyBonus);
  }

  async updateDailyStreak(
    telegram_id: number,
  ): Promise<{ success: boolean; reward: number }> {
    const dailyBonus = await this.findDailyBonus(telegram_id);
    if (!dailyBonus) {
      throw new Error('Daily bonus record not found');
    }

    if (dailyBonus.reward_claimed_today) {
      throw new Error('Reward already claimed today');
    }

    const reward = this.calculateReward(dailyBonus.daily_streak);

    dailyBonus.reward_claimed_today = true;
    await this.dailyBonusRepository.save(dailyBonus);

    await this.increaseBalance(telegram_id, reward);

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

  // AFK Farm
  async findAfkFarm(telegram_id: number): Promise<AfkFarm> {
    const afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id },
    });
    if (!afkFarm) {
      throw new NotFoundException('AFK farm record not found');
    }
    return afkFarm;
  }

  async findAllAfkFarms(): Promise<AfkFarm[]> {
    return this.afkFarmRepository.find();
  }

  async updateAfkStartTime(
    telegram_id: number,
    afk_start_time: Date,
  ): Promise<AfkFarm> {
    let afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id },
    });
    if (!afkFarm) {
      afkFarm = this.afkFarmRepository.create({
        telegram_id,
        afk_start_time,
        coins_per_hour: 0,
      });
    } else {
      afkFarm.afk_start_time = afk_start_time;
    }
    return this.afkFarmRepository.save(afkFarm);
  }

  async updateAfkFarm(updateAfkFarmDto: UpdateAfkFarmDto): Promise<AfkFarm> {
    let afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id: updateAfkFarmDto.telegram_id },
    });
    if (!afkFarm) {
      afkFarm = this.afkFarmRepository.create(updateAfkFarmDto);
    } else {
      afkFarm.coins_per_hour = updateAfkFarmDto.coins_per_hour;
      afkFarm.afk_start_time = updateAfkFarmDto.afk_start_time;
    }
    return this.afkFarmRepository.save(afkFarm);
  }

  async getTopEarnings(): Promise<any[]> {
    const topEarnings = await this.afkFarmRepository.find({
      order: { coins_per_hour: 'DESC' },
      take: 10,
    });

    const leaderBoard = await Promise.all(
      topEarnings.map(async (afkFarm, index) => {
        const username = await this.usernamesRepository.findOne({
          where: { telegram_id: afkFarm.telegram_id },
        });
        return {
          rank: index + 1,
          telegram_id: afkFarm.telegram_id,
          coins_per_hour: afkFarm.coins_per_hour,
          username: username ? username.username : 'Unnamed User',
        };
      }),
    );

    return leaderBoard;
  }

  // Referrals
  async findAllReferrals(): Promise<ReferralResponseDto[]> {
    const referrals = await this.referralRepository.find({
      relations: ['user'],
    });

    return await Promise.all(
      referrals.map(async (referral) => {
        const refs = await Promise.all(
          referral.user.referrals.map(async (ref) => {
            const username = await this.usernamesRepository.findOne({
              where: { telegram_id: ref.ref_id },
            });
            const passiveIncome = await this.afkFarmRepository.findOne({
              where: { telegram_id: ref.ref_id },
            });
            return {
              ref_id: ref.ref_id,
              reward_received: ref.reward_received,
              award: ref.award,
              username: username ? username.username : 'Unnamed User',
              passiveIncome: passiveIncome ? passiveIncome.coins_per_hour : 0,
            };
          }),
        );

        // Сортировка по passiveIncome от большего к меньшему
        refs.sort((a, b) => b.passiveIncome - a.passiveIncome);

        return { telegram_id: referral.user.telegram_id, ref_ids: refs };
      }),
    );
  }

  async findReferral(telegram_id: number): Promise<ReferralResponseDto> {
    const user = await this.userRepository.findOne({
      where: { telegram_id },
      relations: ['referrals'],
    });

    if (!user || !user.referrals.length) {
      throw new NotFoundException('No refs found for this user');
    }

    const refs = await Promise.all(
      user.referrals.map(async (ref) => {
        const username = await this.usernamesRepository.findOne({
          where: { telegram_id: ref.ref_id },
        });
        const passiveIncome = await this.afkFarmRepository.findOne({
          where: { telegram_id: ref.ref_id },
        });
        return {
          ref_id: ref.ref_id,
          reward_received: ref.reward_received,
          award: ref.award,
          username: username ? username.username : 'Unnamed User',
          passiveIncome: passiveIncome ? passiveIncome.coins_per_hour : 0,
        };
      }),
    );

    // Сортировка по passiveIncome от большего к меньшему
    refs.sort((a, b) => b.passiveIncome - a.passiveIncome);

    return { telegram_id: user.telegram_id, ref_ids: refs };
  }

  async addReferral(
    telegram_id: number,
    referral_id: number,
    is_premium?: boolean,
  ): Promise<Referral> {
    const referrer = await this.userRepository.findOne({
      where: { telegram_id },
      relations: ['referrals'],
    });

    if (!referrer) {
      throw new NotFoundException('Referrer not found');
    }

    const referral = new Referral();
    referral.ref_id = referral_id;
    referral.user = referrer;
    referral.award = is_premium ? 5000 : 750;

    referrer.referrals.push(referral);

    await this.referralRepository.save(referral);

    return referral;
  }

  async claimReward(telegram_id: number, ref_id: number): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { user: { telegram_id } },
      relations: ['user'],
    });

    if (!referral) {
      throw new NotFoundException('No refs found for this user');
    }

    const referralToUpdate = await this.referralRepository.findOne({
      where: { user: { telegram_id }, ref_id },
    });

    if (!referralToUpdate) {
      throw new NotFoundException('Ref not found');
    }

    if (referralToUpdate.reward_received) {
      throw new BadRequestException('Reward already claimed');
    }

    const award = referralToUpdate.award;
    await this.increaseBalance(telegram_id, award);
    referralToUpdate.reward_received = true;
    await this.referralRepository.save(referralToUpdate);
  }

  // User Quests
  async findUserQuests(telegram_id: number): Promise<UserQuest[]> {
    return this.userQuestRepository.find({
      where: { user: { telegram_id } },
      relations: ['quest'],
    });
  }

  async markQuestAsDone(
    telegram_id: number,
    quest_id: number,
  ): Promise<UserQuest> {
    const quest = await this.questRepository.findOne({
      where: { quest_id },
    });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (quest.quest_method === 'EARN') {
      const userBalance = await this.findBalance(telegram_id);
      if (userBalance.balance < quest.earn_amount) {
        throw new BadRequestException(
          `User balance is less than the required amount: ${quest.earn_amount}`,
        );
      }
    } else if (quest.quest_method === 'REF') {
      const userReferrals = await this.findReferral(telegram_id);
      if (userReferrals.ref_ids.length < quest.ref_count) {
        throw new BadRequestException(
          `User referrals are less than the required count: ${quest.ref_count}`,
        );
      }
    }

    await this.increaseBalance(telegram_id, quest.reward);

    let userQuest = await this.userQuestRepository.findOne({
      where: { user: { telegram_id }, quest: { quest_id } },
    });

    if (!userQuest) {
      const user = await this.userRepository.findOne({
        where: { telegram_id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      userQuest = this.userQuestRepository.create({
        user,
        quest,
        is_done: true,
      });
    } else {
      userQuest.is_done = true;
    }

    return this.userQuestRepository.save(userQuest);
  }

  // User Upgrades
  async findUserUpgrades(telegram_id: number): Promise<UserUpgrade[]> {
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
    const upgrade = await this.upgradeRepository.findOne({
      where: { upgrade_id },
    });
    if (!upgrade) {
      throw new HttpException('Upgrade not found', HttpStatus.NOT_FOUND);
    }

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

    let totalCost = 0;
    const { start_cost, end_cost, levels } = upgrade;
    const costRatio = Math.pow(end_cost / start_cost, 1 / (levels - 1));

    for (let lvl = currentLevel + 1; lvl <= level; lvl++) {
      const cost = start_cost * Math.pow(costRatio, lvl - 1);
      totalCost += cost;
    }

    const userBalance = await this.findBalance(telegram_id);
    if (!userBalance || userBalance.balance < totalCost) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    await this.deductBalance(telegram_id, totalCost);

    const savedUserUpgrade = await this.userUpgradeRepository.save(userUpgrade);

    await this.updateAfkFarmIncome(telegram_id);

    return savedUserUpgrade;
  }

  private async updateAfkFarmIncome(telegram_id: number): Promise<void> {
    const userUpgrades = await this.findUserUpgrades(telegram_id);

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

        const currentIncome =
          start_income * Math.pow(incomeRatio, userUpgrade.level - 1);

        totalIncomePerHour += currentIncome;
      }
    }

    const totalIncomePerHourInt = Math.floor(totalIncomePerHour);

    await this.updateAfkFarm({
      telegram_id,
      coins_per_hour: totalIncomePerHourInt,
      afk_start_time: new Date(),
    });
  }
}
