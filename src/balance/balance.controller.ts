import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { Balance } from './balance.entity';

@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<Balance> {
    return this.balanceService.findOne(telegram_id);
  }

  @Post('update')
  updateBalance(
    @Body() data: { telegram_id: number; new_balance: number },
  ): Promise<Balance> {
    return this.balanceService.updateBalance(
      data.telegram_id,
      data.new_balance,
    );
  }

  @Get('leaderboard/top')
  getTopBalances(): Promise<any[]> {
    return this.balanceService.getTopBalances();
  }
}
