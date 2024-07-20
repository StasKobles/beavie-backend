import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { Upgrade } from './upgrade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Upgrade])],
  providers: [UpgradeService],
  controllers: [UpgradeController],
  exports: [UpgradeService],
})
export class UpgradeModule {}
