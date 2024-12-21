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

@Entity('afk_farm')
export class AfkFarm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', default: 0 })
  coins_per_hour: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  afk_start_time: Date;

  @OneToOne(() => User, (user) => user.afkFarm, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
