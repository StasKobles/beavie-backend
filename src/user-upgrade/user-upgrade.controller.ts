import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserUpgradeService } from './user-upgrade.service';
import { UserUpgrade } from './user-upgrade.entity';

@ApiTags('user-upgrades')
@Controller('user-upgrades')
export class UserUpgradeController {
  constructor(private readonly userUpgradeService: UserUpgradeService) {}

  @Get(':telegram_id')
  @ApiOperation({ summary: 'Get user upgrade by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User upgrade found',
    type: UserUpgrade,
  })
  @ApiResponse({ status: 404, description: 'User upgrade not found' })
  findOne(@Param('telegram_id') telegram_id: number): Promise<UserUpgrade[]> {
    return this.userUpgradeService.findOne(telegram_id);
  }

  @Get('all/:telegram_id')
  @ApiOperation({ summary: 'Get all user upgrades by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'All user upgrades found',
    type: [UserUpgrade],
  })
  @ApiResponse({ status: 404, description: 'User upgrades not found' })
  findAll(@Param('telegram_id') telegram_id: number): Promise<UserUpgrade[]> {
    return this.userUpgradeService.findAll(telegram_id);
  }

  @Post()
  @ApiOperation({ summary: 'Upgrade a user' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        upgrade_id: 1,
        level: 2,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User upgraded successfully',
    type: UserUpgrade,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  upgradeUser(
    @Body() data: { telegram_id: number; upgrade_id: number; level: number },
  ): Promise<UserUpgrade> {
    return this.userUpgradeService.upgradeUser(
      data.telegram_id,
      data.upgrade_id,
      data.level,
    );
  }
}
