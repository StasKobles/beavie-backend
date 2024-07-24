import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { UsernamesService } from '../usernames/usernames.service';
import { ReferralResponseDto } from './dto/referral-response.dto';
import { Referral } from './referral.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private balanceService: BalanceService,
    private usernamesService: UsernamesService,
  ) {}

  async findAll(): Promise<ReferralResponseDto[]> {
    const referrals = await this.referralRepository.find({
      relations: ['user'],
    });
    return await Promise.all(
      referrals.map(async (referral) => {
        const refs = await Promise.all(
          referral.user.referrals.map(async (ref) => {
            const username = await this.usernamesService.findOne(ref.ref_id);
            const balance = await this.balanceService.findOne(ref.ref_id);
            return {
              ref_id: ref.ref_id,
              reward_received: ref.reward_received,
              award: ref.award,
              username: username ? username.username : 'Unnamed User',
              balance: balance ? balance.balance : 0,
            };
          }),
        );
        return { telegram_id: referral.user.telegram_id, ref_ids: refs };
      }),
    );
  }

  async findOne(telegram_id: number): Promise<ReferralResponseDto> {
    const user = await this.userRepository.findOne({
      where: { telegram_id },
      relations: ['referrals'],
    });

    if (!user || !user.referrals.length) {
      throw new NotFoundException('No refs found for this user');
    }

    const refs = await Promise.all(
      user.referrals.map(async (ref) => {
        const username = await this.usernamesService.findOne(ref.ref_id);
        const balance = await this.balanceService.findOne(ref.ref_id);
        return {
          ref_id: ref.ref_id,
          reward_received: ref.reward_received,
          award: ref.award,
          username: username ? username.username : 'Unnamed User',
          balance: balance ? balance.balance : 0,
        };
      }),
    );

    return { telegram_id: user.telegram_id, ref_ids: refs };
  }

  async addReferral(
    telegram_id: number,
    referral_id: number,
    is_premium?: boolean,
  ): Promise<Referral> {
    const referrer = await this.userRepository.findOne({
      where: { telegram_id },
      relations: ['referrals'],
    });

    if (!referrer) {
      throw new NotFoundException('Referrer not found');
    }

    const referral = new Referral();
    referral.ref_id = referral_id;
    referral.user = referrer;
    referral.award = is_premium ? 5000 : 750;

    referrer.referrals.push(referral);

    await this.referralRepository.save(referral);

    return referral;
  }

  async claimReward(telegram_id: number, ref_id: number): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { user: { telegram_id } },
      relations: ['user'],
    });

    if (!referral) {
      throw new NotFoundException('No refs found for this user');
    }

    const referralToUpdate = await this.referralRepository.findOne({
      where: { user: { telegram_id }, ref_id },
    });

    if (!referralToUpdate) {
      throw new NotFoundException('Ref not found');
    }

    if (referralToUpdate.reward_received) {
      throw new BadRequestException('Reward already claimed');
    }

    const award = referralToUpdate.award;
    await this.balanceService.increaseBalance(telegram_id, award);
    referralToUpdate.reward_received = true;
    await this.referralRepository.save(referralToUpdate);
  }
}
