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
} from '@nestjs/common';
import { ReferralResponseDto } from './dto/referral-response.dto';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':telegram_id')
  async findOne(
    @Param('telegram_id') telegram_id: number,
  ): Promise<ReferralResponseDto> {
    try {
      return await this.referralService.findOne(telegram_id);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('claim')
  async claimReward(
    @Body() data: { telegram_id: number; ref_id: number },
  ): Promise<{ success: boolean }> {
    try {
      await this.referralService.claimReward(data.telegram_id, data.ref_id);
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
}
