import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './balance.entity';
import { UsernamesService } from '../usernames/usernames.service';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    private usernamesService: UsernamesService,
  ) {}

  async findOne(telegram_id: number): Promise<Balance> {
    return this.balanceRepository.findOne({ where: { telegram_id } });
  }

  async updateBalance(
    telegram_id: number,
    new_balance: number,
  ): Promise<Balance> {
    let balance = await this.balanceRepository.findOne({
      where: { telegram_id },
    });
    if (!balance) {
      balance = this.balanceRepository.create({
        telegram_id,
        balance: new_balance,
      });
    } else {
      balance.balance = new_balance;
    }
    return this.balanceRepository.save(balance);
  }

  async getTopBalances(): Promise<any[]> {
    const topBalances = await this.balanceRepository.find({
      order: { balance: 'DESC' },
      take: 10,
    });

    const leaderBoard = await Promise.all(
      topBalances.map(async (balance, index) => {
        const username = await this.usernamesService.findOne(
          balance.telegram_id,
        );
        return {
          rank: index + 1,
          telegram_id: balance.telegram_id,
          balance: balance.balance,
          username: username ? username.username : 'Unnamed User',
        };
      }),
    );

    return leaderBoard;
  }
}
