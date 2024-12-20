import { User } from '../user.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number; // Уникальный идентификатор для каждой записи

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: 'CASCADE' })
  user: User; // Пользователь, создавший реферал

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  ref: User; // Реферал-приглашенный

  @Column({ type: 'boolean', default: false })
  reward_received: boolean;

  @Column({ type: 'int', default: 0 })
  award: number;
}
