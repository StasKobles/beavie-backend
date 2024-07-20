import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { Balance } from './balance.entity';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<Balance> {
    return this.balanceService.findOne(telegram_id);
  }

  @Post()
  updateBalance(
    @Body() updateData: { telegram_id: number; new_balance: number },
  ): Promise<Balance> {
    return this.balanceService.updateBalance(
      updateData.telegram_id,
      updateData.new_balance,
    );
  }
}
