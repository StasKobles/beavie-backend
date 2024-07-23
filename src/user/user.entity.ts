import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column()
  registered_at: Date;

  @Column()
  status: string;

  @Column({ type: 'varchar', length: 2, default: 'en' })
  locale: string;
}
