import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpgradeTranslation } from './upgrade_translations.entity';

@Entity('upgrades')
export class Upgrade {
  @PrimaryGeneratedColumn()
  upgrade_id: number;

  @Column('int')
  start_income: number;

  @Column('int')
  end_income: number;

  @Column('int')
  start_cost: number;

  @Column('int')
  end_cost: number;

  @Column('int')
  levels: number;

  @Column('text', { nullable: true })
  image_url: string;

  @OneToMany(() => UpgradeTranslation, (translation) => translation.upgrade, {
    cascade: true,
  })
  translations: UpgradeTranslation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
