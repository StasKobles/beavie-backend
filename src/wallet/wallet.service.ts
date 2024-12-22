import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from '../user/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Привязка кошелька

  async bindWallet(
    userId: number,
    walletData: Partial<Wallet>,
  ): Promise<Wallet> {
    const user = await this.userRepository.findOne({
      where: { telegram_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, есть ли у пользователя уже привязанный кошелек
    let wallet = await this.walletRepository.findOne({
      where: { user: { telegram_id: userId } },
    });

    if (wallet) {
      // Обновляем существующий кошелек
      Object.assign(wallet, walletData);
    } else {
      // Создаем новый кошелек
      wallet = this.walletRepository.create({ ...walletData, user });
    }

    return this.walletRepository.save(wallet);
  }

  // Отвязка кошелька
  async unbindWallet(userId: number): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { telegram_id: userId } },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.walletRepository.remove(wallet);
  }

  // Получение кошелька по ID пользователя
  async getWalletByUserId(userId: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { telegram_id: userId } },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  // Обновление кошелька
  async updateWallet(
    userId: number,
    updateData: Partial<Wallet>,
  ): Promise<Wallet> {
    const wallet = await this.getWalletByUserId(userId);
    Object.assign(wallet, updateData);
    return this.walletRepository.save(wallet);
  }
}
