import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyBonusService } from './daily-bonus.service';
import { DailyBonusController } from './daily-bonus.controller';
import { DailyBonus } from './daily-bonus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyBonus])],
  providers: [DailyBonusService],
  controllers: [DailyBonusController],
})
export class DailyBonusModule {}
