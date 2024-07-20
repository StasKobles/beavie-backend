import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyBonusService } from './daily-bonus.service';
import { DailyBonusController } from './daily-bonus.controller';
import { DailyBonus } from './daily-bonus.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyBonusScheduler } from './daily-bonus.scheduler';
import { BalanceModule } from '../balance/balance.module'; // Импортируем модуль баланса

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyBonus]),
    ScheduleModule.forRoot(),
    BalanceModule, // Импортируем модуль баланса
  ],
  providers: [DailyBonusService, DailyBonusScheduler],
  controllers: [DailyBonusController],
})
export class DailyBonusModule {}
