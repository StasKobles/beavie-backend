import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BalanceUpdateService } from './balance-update.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ScheduleModule.forRoot(), UserModule],
  providers: [BalanceUpdateService],
})
export class BalanceUpdateModule {}
