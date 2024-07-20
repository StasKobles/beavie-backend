import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfkFarmService } from './afk-farm.service';
import { AfkFarm } from './afk-farm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AfkFarm])],
  providers: [AfkFarmService],
  exports: [AfkFarmService],
})
export class AfkFarmModule {}
