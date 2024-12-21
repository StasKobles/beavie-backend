// src/invoice/invoice.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.telegram_id, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  amount: number; // Сумма инвойса

  @Column()
  currency: string; // Валюта

  @Column()
  description: string; // Описание инвойса

  @Column({ unique: true })
  externalId: string; // Уникальный ID инвойса в платежной системе

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'failed'; // Статус инвойса

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
