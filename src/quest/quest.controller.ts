import { Controller, Get } from '@nestjs/common';
import { QuestService } from './quest.service';
import { Quest } from './quest.entity';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  findAll(): Promise<Quest[]> {
    return this.questService.findAll();
  }
}
