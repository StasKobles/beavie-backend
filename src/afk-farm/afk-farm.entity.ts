import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('afk_farm')
export class AfkFarm {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column({ type: 'int' })
  coins_per_hour: number;

  @Column({ type: 'timestamp' })
  afk_start_time: Date;
}
