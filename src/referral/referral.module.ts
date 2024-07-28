import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { Referral } from './referral.entity';
import { BalanceModule } from '../balance/balance.module';
import { UsernamesModule } from '../usernames/usernames.module';
import { User } from 'src/user/user.entity';
import { AfkFarmModule } from 'src/afk-farm/afk-farm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral, User]),
    BalanceModule,
    UsernamesModule,
    AfkFarmModule,
  ],
  providers: [ReferralService],
  controllers: [ReferralController],
  exports: [ReferralService],
})
export class ReferralModule {}
