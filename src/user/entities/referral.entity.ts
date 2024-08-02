import { User } from '../user.entity';
import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryColumn({ type: 'bigint' })
  user_id: number;

  @PrimaryColumn({ type: 'bigint' })
  ref_id: number;

  @Column({ type: 'boolean', default: false })
  reward_received: boolean;

  @Column({ type: 'int', default: 0 })
  award: number;

  @ManyToOne(() => User, (user) => user.referrals, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  ref: User;
}
