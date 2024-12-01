import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { InitUserDto, ReferralResponseDto } from './dto/user.dto';
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

  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved',
    schema: {
      example: {
        total_balance: 1000,
        total_quests: 5,
        total_referrals: 3,
      },
    },
  })
  async getUserStats(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<any> {
    return this.userService.getUserStats(telegram_id);
  }

  @ApiBearerAuth()
  @Post('change-locale')
  @ApiOperation({ summary: 'Change the locale of a user' })
  @ApiBody({
    schema: {
      example: {
        locale: 'ru',
      },
    },
  })
  async changeLocale(
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { locale: string },
  ): Promise<User> {
    try {
      return await this.userService.changeLocale(telegram_id, data.locale);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth()
  @Get('balance')
  @ApiOperation({ summary: 'Get user balance' })
  async findBalance(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<Balance> {
    return this.userService.findBalance(telegram_id);
  }

  @ApiBearerAuth()
  @Post('balance/increase')
  @ApiOperation({ summary: 'Increase user balance' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
      },
    },
  })
  increaseBalance(
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { amount: number },
  ): Promise<Balance> {
    return this.userService.increaseBalance(telegram_id, data.amount);
  }

  @ApiBearerAuth()
  @Post('balance/deduct')
  @ApiOperation({ summary: 'Deduct user balance' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
      },
    },
  })
  deductBalance(
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { amount: number },
  ): Promise<Balance> {
    return this.userService.deductBalance(telegram_id, data.amount);
  }

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @Get('balance/update-time')
  @ApiOperation({ summary: 'Get balance and update AFK start time' })
  async getBalanceAndUpdateTime(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<Balance> {
    return this.userService.getBalanceAndUpdateTime(telegram_id);
  }

  @ApiBearerAuth()
  @Get('daily-bonus')
  @ApiOperation({ summary: 'Get daily bonus status' })
  async findDailyBonus(
    @GetUser('telegram_id') telegram_id: number,
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

  @ApiBearerAuth()
  @Post('daily-bonus/update')
  @ApiOperation({ summary: 'Update daily bonus streak' })
  async updateDailyStreak(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<{ success: boolean; reward: number }> {
    return await this.userService.updateDailyStreak(telegram_id);
  }

  @ApiBearerAuth()
  @Get('referral')
  @ApiOperation({ summary: 'Get referral info' })
  async findReferral(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<ReferralResponseDto> {
    return await this.userService.findReferral(telegram_id);
  }

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @Post('referral/claim')
  @ApiOperation({ summary: 'Claim referral reward' })
  @ApiBody({
    schema: {
      example: {
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
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { ref_id: number },
  ): Promise<{ success: boolean }> {
    try {
      await this.userService.claimReward(telegram_id, data.ref_id);
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

  @ApiBearerAuth()
  @Get('quest')
  @ApiOperation({ summary: 'Get user quests' })
  findOneQuest(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<UserQuest[]> {
    return this.userService.findUserQuests(telegram_id);
  }

  @ApiBearerAuth()
  @Post('quest/mark-done')
  @ApiOperation({ summary: 'Mark a quest as done' })
  @ApiBody({
    schema: {
      example: {
        quest_id: 1,
      },
    },
  })
  markQuestAsDone(
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { quest_id: number },
  ): Promise<UserQuest> {
    return this.userService.markQuestAsDone(telegram_id, data.quest_id);
  }
  @ApiBearerAuth()
  @Get('upgrades')
  @ApiOperation({ summary: 'Get all user upgrades' })
  findUserUpgrades(
    @GetUser('telegram_id') telegram_id: number,
  ): Promise<UserUpgrade[]> {
    return this.userService.findUserUpgrades(telegram_id);
  }

  @ApiBearerAuth()
  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade a user' })
  @ApiBody({
    schema: {
      example: {
        upgrade_id: 1,
        level: 2,
      },
    },
  })
  upgradeUser(
    @GetUser('telegram_id') telegram_id: number,
    @Body() data: { upgrade_id: number; level: number },
  ): Promise<UserUpgrade> {
    return this.userService.upgradeUser(
      telegram_id,
      data.upgrade_id,
      data.level,
    );
  }

  @ApiBearerAuth()
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
