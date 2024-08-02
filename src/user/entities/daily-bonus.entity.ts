import { User } from '../user.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity('daily_bonuses')
export class DailyBonus {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'int', default: 0 })
  daily_streak: number;

  @Column({ type: 'boolean', default: false })
  reward_claimed_today: boolean;

  @ManyToOne(() => User, (user) => user.dailyBonuses)
  user: User;
}
