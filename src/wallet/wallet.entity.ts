import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets')
@Unique(['address'])
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string; // Адрес кошелька (уникальный)

  @Column()
  publicKey: string; // Публичный ключ

  @Column({ nullable: true })
  appName: string; // Название приложения-кошелька

  @Column({ nullable: true })
  platform: string; // Платформа, например, ios/android

  @Column({ nullable: true })
  appVersion: string; // Версия приложения

  @OneToOne(() => User, (user) => user.telegram_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Связь с пользователем

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
