import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';

@Entity('quest_translations')
export class QuestTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quest, (quest) => quest.translations, {
    onDelete: 'CASCADE',
  })
  quest: Quest;

  @Column()
  quest_id: number;

  @Column()
  locale: string;

  @Column()
  name: string;

  @Column('text')
  description: string;
}
