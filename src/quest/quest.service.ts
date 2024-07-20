import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
  ) {}

  async findAll(): Promise<Quest[]> {
    return this.questRepository.find();
  }
  async findOne(quest_id: number): Promise<Quest> {
    const quest = await this.questRepository.findOne({ where: { quest_id } });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    return quest;
  }
}
