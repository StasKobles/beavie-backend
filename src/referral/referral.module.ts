import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { Referral } from './referral.entity';
import { BalanceModule } from '../balance/balance.module';
import { UsernamesModule } from '../usernames/usernames.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral]),
    BalanceModule,
    UsernamesModule,
  ],
  providers: [ReferralService],
  controllers: [ReferralController],
  exports: [ReferralService],
})
export class ReferralModule {}
