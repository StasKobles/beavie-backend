import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { Referral } from './referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  providers: [ReferralService],
  controllers: [ReferralController],
})
export class ReferralModule {}
