import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BalanceUpdateService } from './balance-update.service';
import { AfkFarmModule } from '../afk-farm/afk-farm.module';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [ScheduleModule.forRoot(), AfkFarmModule, BalanceModule],
  providers: [BalanceUpdateService],
})
export class BalanceUpdateModule {}
