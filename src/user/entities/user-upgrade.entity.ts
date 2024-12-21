import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user.entity';
import { Upgrade } from '../../upgrade/upgrade.entity';

@Entity('user_upgrades')
@Index(['user', 'upgrade'], { unique: true }) // Уникальность пары user-upgrade
export class UserUpgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userUpgrades, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Upgrade, { eager: true })
  upgrade: Upgrade;

  @Column()
  @Check('level >= 1') // Минимальный уровень
  @Check('level <= 30') // Максимальный уровень
  level: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cooldown_ends_at: Date;
}
