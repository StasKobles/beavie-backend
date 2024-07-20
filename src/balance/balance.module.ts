import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { Balance } from './balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Balance])],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
