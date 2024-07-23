import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { Upgrade } from './upgrade.entity';
import { UpgradeTranslation } from './upgrade_translations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Upgrade, UpgradeTranslation])],
  providers: [UpgradeService],
  controllers: [UpgradeController],
  exports: [UpgradeService],
})
export class UpgradeModule {}
