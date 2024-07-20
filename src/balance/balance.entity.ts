import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('balances')
export class Balance {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'numeric', default: 0 })
  balance: number;
}
