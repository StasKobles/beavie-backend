import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_upgrades')
export class UserUpgrade {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  upgrades: { upgrade_id: number; level: number }[];
}
