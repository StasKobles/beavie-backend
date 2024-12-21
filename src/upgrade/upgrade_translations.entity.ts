import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Upgrade } from './upgrade.entity';
import { Locale } from 'src/user/user.entity';

@Entity('upgrade_translations')
@Unique(['upgrade', 'locale']) // Уникальность для сущности и языка
export class UpgradeTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Upgrade, (upgrade) => upgrade.translations, {
    onDelete: 'CASCADE',
  })
  upgrade: Upgrade;

  @Column()
  @Index() // Индексация для ускорения запросов
  locale: Locale;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
