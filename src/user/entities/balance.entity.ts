import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.balance, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'numeric', default: 0 })
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
