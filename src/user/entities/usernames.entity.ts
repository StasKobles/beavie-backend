import { User } from '../user.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity('usernames')
export class Usernames {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id: number;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.usernames)
  user: User;
}
