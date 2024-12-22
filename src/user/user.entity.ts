import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AfkFarm } from './entities/afk-farm.entity';
import { Balance } from './entities/balance.entity';
import { DailyBonus } from './entities/daily-bonus.entity';
import { Referral } from './entities/referral.entity';
import { UserQuest } from './entities/user-quest.entity';
import { UserUpgrade } from './entities/user-upgrade.entity';
import { Username } from './entities/username.entity';
import { Wallet } from 'src/wallet/wallet.entity';

export enum Locale {
  EN = 'en',
  RU = 'ru',
}

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  DELETED = 'deleted',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column()
  status: UserStatus;

  @Column({ type: 'varchar', length: 2, default: 'en' })
  locale: Locale;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Referral, (referral) => referral.user)
  referrals: Referral[]; // Много приглашённых

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: 'CASCADE' })
  referredBy: User; // Один пригласивший для текущего пользователя

  @OneToMany(() => UserUpgrade, (userUpgrade) => userUpgrade.user)
  userUpgrades: UserUpgrade[];

  @OneToMany(() => UserQuest, (userQuest) => userQuest.user)
  userQuests: UserQuest[];

  @OneToOne(() => Balance, (balance) => balance.user, { cascade: true })
  balance: Balance;

  @OneToOne(() => AfkFarm, (afkFarm) => afkFarm.user, { cascade: true })
  afkFarm: AfkFarm;

  @OneToOne(() => DailyBonus, (dailyBonus) => dailyBonus.user, {
    cascade: true,
  })
  dailyBonus: DailyBonus;

  @OneToOne(() => Username, (username) => username.user, { cascade: true })
  username: Username;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
    nullable: true,
  }) // Новая связь
  wallet: Wallet; // Связь с кошельком
}
