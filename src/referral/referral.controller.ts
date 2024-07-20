import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { Referral } from './referral.entity';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<Referral> {
    return this.referralService.findOne(telegram_id);
  }

  @Post()
  addReferral(
    @Body() data: { telegram_id: number; ref_id: number },
  ): Promise<Referral> {
    return this.referralService.addReferral(data.telegram_id, data.ref_id);
  }
}
