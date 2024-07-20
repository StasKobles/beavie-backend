import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserUpgradeService } from './user-upgrade.service';
import { UserUpgrade } from './user-upgrade.entity';

@Controller('user-upgrades')
export class UserUpgradeController {
  constructor(private readonly userUpgradeService: UserUpgradeService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<UserUpgrade> {
    return this.userUpgradeService.findOne(telegram_id);
  }

  @Post()
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
