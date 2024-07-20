import { Controller, Get } from '@nestjs/common';
import { UpgradeService } from './upgrade.service';
import { Upgrade } from './upgrade.entity';

@Controller('upgrades')
export class UpgradeController {
  constructor(private readonly upgradeService: UpgradeService) {}

  @Get()
  findAll(): Promise<Upgrade[]> {
    return this.upgradeService.findAll();
  }
}
