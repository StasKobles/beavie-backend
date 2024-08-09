import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import {
  InitUserDto,
  ReferralResponseDto,
  UpdateDailyStreakDto,
} from './dto/user.dto';
import { Balance } from './entities/balance.entity';
import { UserQuest } from './entities/user-quest.entity';
import { UserUpgrade } from './entities/user-upgrade.entity';
import { User } from './user.entity';
import { UserService } from './user.service';

export class UserResponse {
  @ApiProperty({ type: User })
  user: User;

  @ApiProperty()
  isNew: boolean;

  @ApiProperty()
  token: string;
}

class BalanceResponse {
  @ApiProperty({ example: 1000 })
  balance: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

class DailyBonusResponse {
  @ApiProperty({ example: 1 })
  daily_streak: number;

  @ApiProperty({ example: false })
  reward_claimed_today: boolean;
}

class TopBalanceResponse {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: 123456789 })
  telegram_id: number;

  @ApiProperty({ example: 1000 })
  balance: number;

  @ApiProperty({ example: 'user1' })
  username: string;
}

class QuestResponse {
  @ApiProperty({ example: 1 })
  quest_id: number;

  @ApiProperty({ example: true })
  is_done: boolean;
}

class ReferralResponse {
  @ApiProperty({ example: 123456789 })
  telegram_id: number;

  @ApiProperty({ example: 'referral_username' })
  username: string;
}

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a new user' })
  @ApiBody({ type: InitUserDto })
  @ApiResponse({
    status: 201,
    description: 'User initialized successfully',
    type: User,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async initUser(@Body() data: InitUserDto): Promise<{
    user: User;
    isNew: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    const botToken = process.env.BOT_TOKEN;
    if (!this.authService.validateInitData(data.initData, botToken)) {
      console.log('Validation failed');
      throw new UnauthorizedException('Invalid init data');
    }

    try {
      return await this.userService.initUser(data.initData, data.ref_id);
    } catch (error) {
      console.error('Error initializing user:', error); // Логирование ошибки
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/:telegram_id')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved',
    type: Object,
    schema: {
      example: {
        total_balance: 1000,
        total_quests: 5,
        total_referrals: 3,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(@Param('telegram_id') telegram_id: number): Promise<any> {
    return this.userService.getUserStats(telegram_id);
  }

  @Post('change-locale')
  @ApiOperation({ summary: 'Change the locale of a user' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        locale: 'ru',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Locale changed successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeLocale(
    @Body() data: { telegram_id: number; locale: string },
  ): Promise<User> {
    try {
      return await this.userService.changeLocale(data.telegram_id, data.locale);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':telegram_id/balance')
  @ApiOperation({ summary: 'Get balance by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: BalanceResponse,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  findBalance(@Param('telegram_id') telegram_id: number): Promise<Balance> {
    return this.userService.findBalance(telegram_id);
  }

  @Post(':telegram_id/balance/increase')
  @ApiOperation({ summary: 'Increase user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance increased successfully',
    type: BalanceResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
      },
    },
  })
  increaseBalance(
    @Param('telegram_id') telegram_id: number,
    @Body() data: { amount: number },
  ): Promise<Balance> {
    return this.userService.increaseBalance(telegram_id, data.amount);
  }

  @Post(':telegram_id/balance/deduct')
  @ApiOperation({ summary: 'Deduct user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance deducted successfully',
    type: BalanceResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
      },
    },
  })
  deductBalance(
    @Param('telegram_id') telegram_id: number,
    @Body() data: { amount: number },
  ): Promise<Balance> {
    return this.userService.deductBalance(telegram_id, data.amount);
  }

  @Get('balance/leaderboard/top')
  @ApiOperation({ summary: 'Get top balances' })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: [TopBalanceResponse],
    schema: {
      example: [
        { rank: 1, telegram_id: 123456789, balance: 1000, username: 'user1' },
        { rank: 2, telegram_id: 987654321, balance: 900, username: 'user2' },
      ],
    },
  })
  getTopBalances(): Promise<any[]> {
    return this.userService.getTopBalances();
  }

  @Get(':telegram_id/balance/update-time')
  @ApiOperation({ summary: 'Get balance and update AFK start time' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: BalanceResponse,
  })
  @ApiResponse({ status: 404, description: 'Balance not found' })
  getBalanceAndUpdateTime(
    @Param('telegram_id') telegram_id: number,
  ): Promise<Balance> {
    return this.userService.getBalanceAndUpdateTime(telegram_id);
  }

  @Get(':telegram_id/daily-bonus')
  @ApiOperation({ summary: 'Get daily bonus status' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily bonus status retrieved',
    type: DailyBonusResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findDailyBonus(
    @Param('telegram_id') telegram_id: number,
  ): Promise<{ daily_streak: number; reward_claimed_today: boolean }> {
    const dailyBonus = await this.userService.findDailyBonus(telegram_id);
    if (dailyBonus) {
      return {
        daily_streak: dailyBonus.daily_streak,
        reward_claimed_today: dailyBonus.reward_claimed_today,
      };
    } else {
      return {
        daily_streak: 0,
        reward_claimed_today: false,
      };
    }
  }

  @Post(':telegram_id/daily-bonus/update')
  @ApiOperation({ summary: 'Update daily bonus streak' })
  @ApiBody({
    type: UpdateDailyStreakDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Daily bonus updated',
    schema: {
      example: {
        success: true,
        reward: 1000,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async updateDailyStreak(
    @Param('telegram_id') telegram_id: number,
  ): Promise<{ success: boolean; reward: number }> {
    try {
      return await this.userService.updateDailyStreak(telegram_id);
    } catch (error) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':telegram_id/referral')
  @ApiOperation({ summary: 'Get referral info' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: ReferralResponse,
  })
  @ApiResponse({ status: 404, description: 'No refs found for this user' })
  async findReferral(
    @Param('telegram_id') telegram_id: number,
  ): Promise<ReferralResponseDto> {
    try {
      return await this.userService.findReferral(telegram_id);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('referral/all')
  @ApiOperation({ summary: 'Get all referrals' })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: [ReferralResponse],
  })
  async findAllReferrals(): Promise<ReferralResponseDto[]> {
    try {
      return await this.userService.findAllReferrals();
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('referral/claim')
  @ApiOperation({ summary: 'Claim referral reward' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        ref_id: 987654321,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reward claimed successfully',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async claimReward(
    @Body() data: { telegram_id: number; ref_id: number },
  ): Promise<{ success: boolean }> {
    try {
      await this.userService.claimReward(data.telegram_id, data.ref_id);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        error instanceof NotFoundException ||
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':telegram_id/quest')
  @ApiOperation({ summary: 'Get user quest by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User quest found',
    type: [QuestResponse],
  })
  @ApiResponse({ status: 404, description: 'User quest not found' })
  findOneQuest(
    @Param('telegram_id') telegram_id: number,
  ): Promise<UserQuest[]> {
    return this.userService.findUserQuests(telegram_id);
  }

  @Post(':telegram_id/quest/mark-done')
  @ApiOperation({ summary: 'Mark a quest as done' })
  @ApiBody({
    schema: {
      example: {
        quest_id: 1,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quest marked as done',
    type: QuestResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  markQuestAsDone(
    @Param('telegram_id') telegram_id: number,
    @Body() data: { quest_id: number },
  ): Promise<UserQuest> {
    return this.userService.markQuestAsDone(telegram_id, data.quest_id);
  }

  @Get(':telegram_id/upgrades')
  @ApiOperation({ summary: 'Get all user upgrades by Telegram ID' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'All user upgrades found',
    type: [UserUpgrade],
  })
  @ApiResponse({ status: 404, description: 'User upgrades not found' })
  findUserUpgrades(
    @Param('telegram_id') telegram_id: number,
  ): Promise<UserUpgrade[]> {
    return this.userService.findUserUpgrades(telegram_id);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade a user' })
  @ApiBody({
    schema: {
      example: {
        telegram_id: 123456789,
        upgrade_id: 1,
        level: 2,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User upgraded successfully',
    type: UserUpgrade,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  upgradeUser(
    @Body() data: { telegram_id: number; upgrade_id: number; level: number },
  ): Promise<UserUpgrade> {
    return this.userService.upgradeUser(
      data.telegram_id,
      data.upgrade_id,
      data.level,
    );
  }

  @Get('afk-farm/top-earnings')
  @ApiOperation({ summary: 'Get top 10 players by coins per hour' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of top earnings',
    type: [TopBalanceResponse],
    schema: {
      example: [
        {
          rank: 1,
          telegram_id: 123456789,
          coins_per_hour: 1000,
          username: 'user1',
        },
        {
          rank: 2,
          telegram_id: 987654321,
          coins_per_hour: 900,
          username: 'user2',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'AFK farm record not found' })
  async getTopEarnings(): Promise<any[]> {
    return this.userService.getTopEarnings();
  }
}
