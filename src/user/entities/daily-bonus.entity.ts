import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity('daily_bonuses')
@Unique(['user']) // Обеспечивает, что у одного пользователя только один бонус
export class DailyBonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  daily_streak: number;

  @Column({ type: 'boolean', default: false })
  reward_claimed_today: boolean;

  @OneToOne(() => User, (user) => user.dailyBonus, { onDelete: 'CASCADE' })
  @JoinColumn() // Указывает, что это внешний ключ
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
