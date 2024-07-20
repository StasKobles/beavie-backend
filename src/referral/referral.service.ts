import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './referral.entity';
import { BalanceService } from '../balance/balance.service';
import { UsernamesService } from '../usernames/usernames.service';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    private balanceService: BalanceService,
    private usernamesService: UsernamesService,
  ) {}

  async findOne(telegram_id: number): Promise<Referral> {
    const referral = await this.referralRepository.findOne({
      where: { telegram_id },
    });
    if (!referral) {
      throw new NotFoundException('No refs found for this user');
    }

    const refs = await Promise.all(
      referral.ref_ids.map(async (ref) => {
        const username = await this.usernamesService.findOne(ref.ref_id);
        const balance = await this.balanceService.findOne(ref.ref_id);
        return {
          ...ref,
          username: username ? username.username : 'Unnamed User',
          balance: balance ? balance.balance : 0,
        };
      }),
    );

    return { ...referral, ref_ids: refs };
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

  async claimReward(telegram_id: number, ref_id: number): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { telegram_id },
    });
    if (!referral) {
      throw new NotFoundException('No refs found for this user');
    }

    const refIndex = referral.ref_ids.findIndex((ref) => ref.ref_id === ref_id);
    if (refIndex === -1) {
      throw new NotFoundException('Ref not found');
    }

    if (referral.ref_ids[refIndex].reward_received) {
      throw new BadRequestException('Reward already claimed');
    }

    const award = referral.ref_ids[refIndex].award;
    await this.balanceService.updateBalance(telegram_id, award);
    referral.ref_ids[refIndex].reward_received = true;
    await this.referralRepository.save(referral);
  }
}
