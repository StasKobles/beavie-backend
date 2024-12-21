import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { QuestTranslation } from './quest-translation.entity';
import { Locale } from 'src/user/user.entity';

interface QuestWithTranslations extends Quest {
  name: string;
  description: string;
}

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(QuestTranslation)
    private translationRepository: Repository<QuestTranslation>,
  ) {}

  async findAll(locale: Locale): Promise<QuestWithTranslations[]> {
    const quests = await this.questRepository.find();

    const translatedQuests = await Promise.all(
      quests.map(async (quest) => {
        const translation = await this.translationRepository.findOne({
          where: { quest, locale },
        });

        return {
          ...quest,
          name: translation ? translation.name : 'Default Name',
          description: translation
            ? translation.description
            : 'Default Description',
        };
      }),
    );

    return translatedQuests;
  }

  async findOne(
    quest_id: number,
    locale: Locale,
  ): Promise<QuestWithTranslations> {
    const quest = await this.questRepository.findOne({ where: { quest_id } });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    const translation = await this.translationRepository.findOne({
      where: { quest, locale },
    });

    return {
      ...quest,
      name: translation ? translation.name : 'Default Name',
      description: translation
        ? translation.description
        : 'Default Description',
    };
  }
}
