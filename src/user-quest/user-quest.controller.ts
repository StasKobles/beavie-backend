import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserQuestService } from './user-quest.service';
import { UserQuest } from './user-quest.entity';

@Controller('user-quests')
export class UserQuestController {
  constructor(private readonly userQuestService: UserQuestService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<UserQuest> {
    return this.userQuestService.findOne(telegram_id);
  }

  @Post()
  markQuestAsDone(
    @Body() data: { telegram_id: number; quest_id: number },
  ): Promise<UserQuest> {
    return this.userQuestService.markQuestAsDone(
      data.telegram_id,
      data.quest_id,
    );
  }
}
