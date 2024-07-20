import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_refs')
export class Referral {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  ref_ids: { ref_id: number; reward_received: boolean; award: number }[];
}
