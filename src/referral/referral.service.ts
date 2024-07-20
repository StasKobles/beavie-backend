import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './referral.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
  ) {}

  async findOne(telegram_id: number): Promise<Referral> {
    return this.referralRepository.findOne({ where: { telegram_id } });
  }

  async addReferral(telegram_id: number, ref_id: number): Promise<Referral> {
    let referral = await this.referralRepository.findOne({
      where: { telegram_id },
    });
    if (!referral) {
      referral = this.referralRepository.create({
        telegram_id,
        ref_ids: [{ ref_id, reward_received: false, award: 0 }],
      });
    } else {
      referral.ref_ids.push({ ref_id, reward_received: false, award: 0 });
    }
    return this.referralRepository.save(referral);
  }
}
