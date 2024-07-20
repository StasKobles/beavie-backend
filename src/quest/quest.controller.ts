import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestService } from './quest.service';
import { Quest } from './quest.entity';

@ApiTags('quests')
@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quests' })
  @ApiResponse({ status: 200, description: 'Successful', type: [Quest] })
  findAll(): Promise<Quest[]> {
    return this.questService.findAll();
  }
}
