// upgrade.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Upgrade } from './upgrade.entity';
import { UpgradeService } from './upgrade.service';
import { Locale } from 'src/user/user.entity';

@ApiTags('upgrades')
@Controller('upgrades')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @Get()
  @ApiQuery({
    name: 'locale',
    required: false,
    description: 'Language locale (e.g., en, ru)',
  })
  @ApiResponse({ status: 200, description: 'Successfully fetched upgrades' })
  findAll(@Query('locale') locale: Locale): Promise<Upgrade[]> {
    return this.upgradeService.findAll(locale || Locale.EN); // По умолчанию используем 'en' если локаль не указана
  }
}
