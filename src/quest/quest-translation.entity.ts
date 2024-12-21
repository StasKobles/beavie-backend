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
import { Quest } from './quest.entity';
import { Locale } from 'src/user/user.entity';

@Entity('quest_translations')
@Unique(['quest', 'locale'])
export class QuestTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quest, (quest) => quest.translations, {
    onDelete: 'CASCADE',
  })
  quest: Quest;

  @Column()
  @Index()
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
