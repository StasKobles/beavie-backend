import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { Balance } from './balance.entity';
import { UsernamesModule } from '../usernames/usernames.module';

@Module({
  imports: [TypeOrmModule.forFeature([Balance]), UsernamesModule],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
