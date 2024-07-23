// upgrade.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UpgradeTranslation } from './upgrade_translations.entity';

@Entity('upgrades')
export class Upgrade {
  @PrimaryGeneratedColumn()
  upgrade_id: number;

  @Column('int')
  base_cost: number;

  @Column('int')
  base_income: number;

  @Column('double precision')
  upgrade_factor: number;

  @Column('text', { nullable: true })
  image_url: string;

  @OneToMany(() => UpgradeTranslation, (translation) => translation.upgrade)
  translations: UpgradeTranslation[];
}
