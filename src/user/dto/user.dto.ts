import { ApiProperty } from '@nestjs/swagger';

export class InitUserDto {
  @ApiProperty({ example: 'initData string from Telegram WebApp' })
  initData: string;

  @ApiProperty({ example: 987654321, required: false })
  ref_id?: number | null;
}

export class UpdateBalanceDto {
  @ApiProperty({ example: 123456789 })
  telegram_id: number;

  @ApiProperty({ example: 100 })
  amount: number;
}

export class UpdateDailyStreakDto {
  @ApiProperty({ example: 123456789 })
  telegram_id: number;
}

export class ClaimReferralDto {
  @ApiProperty({ example: 123456789 })
  telegram_id: number;

  @ApiProperty({ example: 987654321 })
  ref_id: number;
}

export class ReferralDto {
  ref_id: number;
  reward_received: boolean;
  award: number;
  username: string;
  passiveIncome: number;
}

export class ReferralResponseDto {
  telegram_id: number;
  ref_ids: ReferralDto[];
}
export class UpdateAfkFarmDto {
  telegram_id: number;
  coins_per_hour: number;
  afk_start_time: Date;
}
