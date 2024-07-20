import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpgradeService } from './upgrade.service';
import { Upgrade } from './upgrade.entity';

@ApiTags('upgrades')
@Controller('upgrades')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all upgrades' })
  @ApiResponse({ status: 200, description: 'Successful', type: [Upgrade] })
  findAll(): Promise<Upgrade[]> {
    return this.upgradeService.findAll();
  }
}
