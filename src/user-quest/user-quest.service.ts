import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuest } from './user-quest.entity';
import { QuestService } from 'src/quest/quest.service';
import { BalanceService } from 'src/balance/balance.service';
import { ReferralService } from 'src/referral/referral.service';

@Injectable()
export class UserQuestService {
  constructor(
    @InjectRepository(UserQuest)
    @InjectRepository(UserQuest)
    private readonly userQuestRepository: Repository<UserQuest>,
    private readonly balanceService: BalanceService,
    private readonly referralService: ReferralService,
    private readonly questService: QuestService,
  ) {}

  async findOne(telegram_id: number): Promise<{
    telegram_id: number;
    quests: { quest_id: number; is_done: boolean }[];
  }> {
    const userQuest = await this.userQuestRepository.findOne({
      where: { telegram_id },
    });
    if (!userQuest) {
      return { telegram_id, quests: [] };
    }
    return userQuest;
  }

  async markQuestAsDone(
    telegram_id: number,
    quest_id: number,
  ): Promise<UserQuest> {
    // Поиск квеста в таблице quests
    const quest = await this.questService.findOne(quest_id, 'en');
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    // Проверка условий выполнения квеста
    if (quest.quest_method === 'EARN') {
      const userBalance = await this.balanceService.findOne(telegram_id);
      if (userBalance.balance < quest.earn_amount) {
        throw new BadRequestException(
          `User balance is less than the required amount: ${quest.earn_amount}`,
        );
      }
    } else if (quest.quest_method === 'REF') {
      const userReferrals = await this.referralService.findOne(telegram_id);
      if (userReferrals.ref_ids.length < quest.ref_count) {
        throw new BadRequestException(
          `User referrals are less than the required count: ${quest.ref_count}`,
        );
      }
    }

    // Начисление награды на баланс пользователя
    await this.balanceService.increaseBalance(telegram_id, quest.reward);

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
    await this.userQuestRepository.save(userQuest);

    return await this.userQuestRepository.findOne({
      where: { telegram_id },
    });
  }
}
