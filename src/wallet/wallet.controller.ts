import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Привязка кошелька
  @ApiBearerAuth()
  @Post()
  async bindWallet(
    @GetUser('telegram_id') telegram_id: number,
    @Body() walletData: Partial<Wallet>,
  ): Promise<void> {
    await this.walletService.bindWallet(telegram_id, walletData);
  }

  // Отвязка кошелька
  @ApiBearerAuth()
  @Delete()
  async unbindWallet(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<void> {
    return this.walletService.unbindWallet(telegram_id);
  }
}
