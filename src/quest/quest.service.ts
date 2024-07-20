import { Injectable } from '@nestjs/common';
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
}
