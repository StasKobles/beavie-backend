import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  ref_id: number;

  @Column({ type: 'boolean', default: false })
  reward_received: boolean;

  @Column({ type: 'int', default: 0 })
  award: number;

  @ManyToOne(() => User, (user) => user.referrals)
  user: User;
}
