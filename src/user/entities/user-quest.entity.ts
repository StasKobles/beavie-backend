import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';
import { Quest } from 'src/quest/quest.entity';

@Entity('user_quests')
export class UserQuest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userQuests, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Quest, { eager: true })
  quest: Quest;

  @Column({ default: false })
  is_done: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assigned_at: Date;
}
