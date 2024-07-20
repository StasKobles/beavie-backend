import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn()
  quest_id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

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
}
