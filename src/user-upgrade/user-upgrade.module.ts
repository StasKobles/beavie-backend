import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUpgradeService } from './user-upgrade.service';
import { UserUpgradeController } from './user-upgrade.controller';
import { UserUpgrade } from './user-upgrade.entity';
import { Upgrade } from '../upgrade/upgrade.entity';
import { AfkFarmModule } from '../afk-farm/afk-farm.module';
import { BalanceModule } from 'src/balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserUpgrade, Upgrade]),
    AfkFarmModule,
    BalanceModule,
  ],
  providers: [UserUpgradeService],
  controllers: [UserUpgradeController],
  exports: [UserUpgradeService],
})
export class UserUpgradeModule {}
