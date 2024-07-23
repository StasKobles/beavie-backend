// upgrade-translation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Upgrade } from './upgrade.entity';

@Entity('upgrade_translations')
export class UpgradeTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Upgrade, (upgrade) => upgrade.translations, {
    onDelete: 'CASCADE',
  })
  upgrade: Upgrade;

  @Column()
  upgrade_id: number;

  @Column()
  locale: string;

  @Column()
  name: string;

  @Column('text')
  description: string;
}
