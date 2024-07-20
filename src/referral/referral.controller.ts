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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ReferralResponseDto } from './dto/referral-response.dto';
import { ReferralService } from './referral.service';

@ApiTags('referral')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':telegram_id')
  @ApiOperation({ summary: 'Get referral info' })
  @ApiParam({
    name: 'telegram_id',
    type: Number,
    description: 'Telegram ID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful',
    type: ReferralResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No refs found for this user' })
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
