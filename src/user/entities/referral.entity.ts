import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity('referrals')
@Index(['user', 'ref'], { unique: true }) // Уникальная пара user и ref
export class Referral {
  @PrimaryGeneratedColumn()
  id: number; // Уникальный идентификатор для каждой записи

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: 'CASCADE' })
  user: User; // Пользователь, пригласивший других

  @ManyToOne(() => User, (user) => user.referredBy, { onDelete: 'CASCADE' })
  ref: User; // Пользователь, который был приглашён

  @Column({ type: 'boolean', default: false })
  reward_received: boolean;

  @Column({ type: 'int', default: 0 })
  award: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
