import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuest } from './user-quest.entity';
import { QuestService } from 'src/quest/quest.service';
import { BalanceService } from 'src/balance/balance.service';

@Injectable()
export class UserQuestService {
  constructor(
    @InjectRepository(UserQuest)
    private userQuestRepository: Repository<UserQuest>,
    private questService: QuestService,
    private balanceService: BalanceService,
  ) {}

  async findOne(telegram_id: number): Promise<UserQuest> {
    return this.userQuestRepository.findOne({ where: { telegram_id } });
  }

  async markQuestAsDone(
    telegram_id: number,
    quest_id: number,
  ): Promise<UserQuest> {
    // Поиск квеста в таблице quests
    const quest = await this.questService.findOne(quest_id);
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    // Начисление награды на баланс пользователя
    await this.balanceService.updateBalance(telegram_id, quest.reward);

    // Поиск или создание записи userQuest
    let userQuest = await this.userQuestRepository.findOne({
      where: { telegram_id },
    });
    if (!userQuest) {
      userQuest = this.userQuestRepository.create({
        telegram_id,
        quests: [{ quest_id, is_done: true }],
      });
    } else {
      const questEntry = userQuest.quests.find((q) => q.quest_id === quest_id);
      if (questEntry) {
        questEntry.is_done = true;
      } else {
        userQuest.quests.push({ quest_id, is_done: true });
      }
    }

    // Сохранение изменений в базе данных
    return this.userQuestRepository.save(userQuest);
  }
}
