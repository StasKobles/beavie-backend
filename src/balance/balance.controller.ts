import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { Balance } from './balance.entity';

@ApiTags('balances')
@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':telegram_id')
  @ApiOperation({ summary: 'Get balance by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({ status: 200, description: 'Successful', type: Balance })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  findOne(@Param('telegram_id') telegram_id: number): Promise<Balance> {
    return this.balanceService.findOne(telegram_id);
  }

  @ApiOperation({ summary: 'Increase user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance increased successfully',
    type: Balance,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      properties: {
        telegram_id: { type: 'number' },
        amount: { type: 'number' },
      },
    },
  })
  @Post('increase')
  increaseBalance(
    @Body() data: { telegram_id: number; amount: number },
  ): Promise<Balance> {
    return this.balanceService.increaseBalance(data.telegram_id, data.amount);
  }

  @ApiOperation({ summary: 'Deduct user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance deducted successfully',
    type: Balance,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiBody({
    schema: {
      properties: {
        telegram_id: { type: 'number' },
        amount: { type: 'number' },
      },
    },
  })
  @Post('deduct')
  deductBalance(
    @Body() data: { telegram_id: number; amount: number },
  ): Promise<Balance> {
    return this.balanceService.deductBalance(data.telegram_id, data.amount);
  }
  updateBalance(
    @Body() data: { telegram_id: number; new_balance: number },
  ): Promise<Balance> {
    return this.balanceService.increaseBalance(
      data.telegram_id,
      data.new_balance,
    );
  }

  @Get('leaderboard/top')
  @ApiOperation({ summary: 'Get top balances' })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    schema: {
      example: [
        { rank: 1, telegram_id: 123456789, balance: 1000, username: 'user1' },
        { rank: 2, telegram_id: 987654321, balance: 900, username: 'user2' },
      ],
    },
  })
  getTopBalances(): Promise<any[]> {
    return this.balanceService.getTopBalances();
  }

  @Get('update-time/:telegram_id')
  @ApiOperation({ summary: 'Get balance and update AFK start time' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({ status: 200, description: 'Successful', type: Balance })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  getBalanceAndUpdateTime(
    @Param('telegram_id') telegram_id: number,
  ): Promise<Balance> {
    return this.balanceService.getBalanceAndUpdateTime(telegram_id);
  }
}
