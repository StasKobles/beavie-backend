import { User } from '../user.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'numeric', default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.balances)
  user: User;
}
