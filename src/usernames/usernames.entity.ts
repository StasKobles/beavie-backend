import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usernames')
export class Usernames {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column()
  username: string;
}
