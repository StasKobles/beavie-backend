import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { UserUpgrade } from './entities/user-upgrade.entity';
import { UserQuest } from './entities/user-quest.entity';
import { Balance } from './entities/balance.entity';
import { AfkFarm } from './entities/afk-farm.entity';
import { DailyBonus } from './entities/daily-bonus.entity';
import { Usernames } from './entities/usernames.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column()
  registered_at: Date;

  @Column()
  status: string;

  @Column({ type: 'varchar', length: 2, default: 'en' })
  locale: string;

  @OneToMany(() => Referral, (referral) => referral.user)
  referrals: Referral[];

  @OneToMany(() => Referral, (referral) => referral.ref)
  referredBy: Referral[];

  @OneToMany(() => UserUpgrade, (userUpgrade) => userUpgrade.user)
  userUpgrades: UserUpgrade[];

  @OneToMany(() => UserQuest, (userQuest) => userQuest.user)
  userQuests: UserQuest[];

  @OneToMany(() => Balance, (balance) => balance.user)
  balances: Balance[];

  @OneToMany(() => AfkFarm, (afkFarm) => afkFarm.user)
  afkFarms: AfkFarm[];

  @OneToMany(() => DailyBonus, (dailyBonus) => dailyBonus.user)
  dailyBonuses: DailyBonus[];

  @OneToMany(() => Usernames, (username) => username.user)
  usernames: Usernames[];
}
