import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
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
}
