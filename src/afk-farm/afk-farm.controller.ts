import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AfkFarmService } from './afk-farm.service';

@Controller('afk-farm')
@ApiTags('AFK Farm')
export class AfkFarmController {
  constructor(private readonly afkFarmService: AfkFarmService) {}

  @Get('top-earnings')
  @ApiOperation({ summary: 'Get top 10 players by coins per hour' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of top earnings',
  })
  @ApiResponse({ status: 404, description: 'AFK farm record not found' })
  async getTopEarnings() {
    return this.afkFarmService.getTopEarnings();
  }
}
