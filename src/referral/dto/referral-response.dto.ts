export class ReferralDto {
  ref_id: number;
  reward_received: boolean;
  award: number;
  username: string;
  balance: number;
}

export class ReferralResponseDto {
  telegram_id: number;
  ref_ids: ReferralDto[];
}
