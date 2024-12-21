import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Quest } from './quest.entity';
import { QuestService } from './quest.service';
import { Locale } from 'src/user/user.entity';

@ApiTags('quests')
@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quests' })
  @ApiResponse({ status: 200, description: 'Successful', type: [Quest] })
  findAll(@Query('locale') locale: Locale): Promise<Quest[]> {
    return this.questService.findAll(locale || Locale.EN);
  }

  @Get()
  @ApiOperation({ summary: 'Get quest by ID' })
  @ApiResponse({ status: 200, description: 'Successful', type: Quest })
  findOne(
    @GetUser('telegram_id') telegram_id: number, // Получаем telegram_id из JWT
    @Query('locale') locale: Locale,
  ): Promise<Quest> {
    return this.questService.findOne(telegram_id, locale || Locale.EN); // Передаем telegram_id в сервис
  }
}
