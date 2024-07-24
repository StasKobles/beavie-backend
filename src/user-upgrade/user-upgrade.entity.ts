import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Upgrade } from '../upgrade/upgrade.entity';

@Entity('user_upgrades')
export class UserUpgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userUpgrades, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Upgrade, { eager: true })
  upgrade: Upgrade;

  @Column()
  level: number;

  @Column({ type: 'timestamp' })
  upgraded_at: Date;
}
