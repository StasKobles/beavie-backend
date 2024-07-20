import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuest } from './user-quest.entity';

@Injectable()
export class UserQuestService {
  constructor(
    @InjectRepository(UserQuest)
    private userQuestRepository: Repository<UserQuest>,
  ) {}

  async findOne(telegram_id: number): Promise<UserQuest> {
    return this.userQuestRepository.findOne({ where: { telegram_id } });
  }

  async markQuestAsDone(
    telegram_id: number,
    quest_id: number,
  ): Promise<UserQuest> {
    let userQuest = await this.userQuestRepository.findOne({
      where: { telegram_id },
    });
    if (!userQuest) {
      userQuest = this.userQuestRepository.create({
        telegram_id,
        quests: [{ quest_id, is_done: true }],
      });
    } else {
      const quest = userQuest.quests.find((q) => q.quest_id === quest_id);
      if (quest) {
        quest.is_done = true;
      } else {
        userQuest.quests.push({ quest_id, is_done: true });
      }
    }
    return this.userQuestRepository.save(userQuest);
  }
}
