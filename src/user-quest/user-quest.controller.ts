import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserQuestService } from './user-quest.service';
import { UserQuest } from './user-quest.entity';

@ApiTags('user-quests')
@Controller('user-quests')
export class UserQuestController {
  constructor(private readonly userQuestService: UserQuestService) {}

  @Get(':telegram_id')
  @ApiOperation({ summary: 'Get user quest by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User quest found',
    type: UserQuest,
  })
  @ApiResponse({ status: 404, description: 'User quest not found' })
  findOne(@Param('telegram_id') telegram_id: number): Promise<UserQuest> {
    return this.userQuestService.findOne(telegram_id);
  }

  @Post()
  @ApiOperation({ summary: 'Mark a quest as done' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        quest_id: 1,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quest marked as done',
    type: UserQuest,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  markQuestAsDone(
    @Body() data: { telegram_id: number; quest_id: number },
  ): Promise<UserQuest> {
    return this.userQuestService.markQuestAsDone(
      data.telegram_id,
      data.quest_id,
    );
  }
}
