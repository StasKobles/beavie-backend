import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuestTranslation } from './quest-translation.entity';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn()
  quest_id: number;

  @Column({ type: 'varchar', length: 10 })
  quest_method: 'REF' | 'EARN' | 'LINK';

  @Column({ nullable: true })
  quest_link?: string;

  @Column('int', { nullable: true })
  earn_amount?: number;

  @Column('int', { nullable: true })
  ref_count?: number;

  @Column('boolean')
  is_available: boolean;

  @Column('int')
  reward: number;

  @Column()
  logo_url: string;

  @OneToMany(() => QuestTranslation, (translation) => translation.quest, {
    cascade: true,
  })
  translations: QuestTranslation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
