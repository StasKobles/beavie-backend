import { Controller, Get, Query, Param } from '@nestjs/common';
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
  findAll(@Query('locale') locale: string): Promise<Quest[]> {
    return this.questService.findAll(locale || 'en');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quest by ID' })
  @ApiResponse({ status: 200, description: 'Successful', type: Quest })
  findOne(
    @Param('id') id: number,
    @Query('locale') locale: string,
  ): Promise<Quest> {
    return this.questService.findOne(id, locale || 'en');
  }
}
