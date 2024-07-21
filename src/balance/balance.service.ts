import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './balance.entity';
import { UsernamesService } from '../usernames/usernames.service';
import { AfkFarmService } from '../afk-farm/afk-farm.service';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    private usernamesService: UsernamesService,
    private afkFarmService: AfkFarmService,
  ) {}

  async findOne(telegram_id: number): Promise<Balance> {
    return this.balanceRepository.findOne({ where: { telegram_id } });
  }

  async increaseBalance(telegram_id: number, amount: number): Promise<Balance> {
    let balance = await this.balanceRepository.findOne({
      where: { telegram_id },
    });
    if (!balance) {
      balance = this.balanceRepository.create({
        telegram_id,
        balance: amount,
      });
    } else {
      balance.balance = Number(balance.balance) + amount;
    }
    return this.balanceRepository.save(balance);
  }

  async deductBalance(telegram_id: number, amount: number): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { telegram_id },
    });
    if (!balance) {
      throw new HttpException(
        'User does not have a balance record',
        HttpStatus.NOT_FOUND,
      );
    } else if (balance.balance < amount) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    } else {
      balance.balance -= amount;
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

  async getBalanceAndUpdateTime(telegram_id: number): Promise<Balance> {
    await this.afkFarmService.updateAfkStartTime(telegram_id, new Date());

    return this.findOne(telegram_id);
  }
}
