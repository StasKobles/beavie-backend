import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_quests')
export class UserQuest {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  quests: { quest_id: number; is_done: boolean }[];
}
