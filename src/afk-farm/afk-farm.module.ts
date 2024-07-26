import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsernamesModule } from 'src/usernames/usernames.module';
import { AfkFarmController } from './afk-farm.controller';
import { AfkFarm } from './afk-farm.entity';
import { AfkFarmService } from './afk-farm.service';

@Module({
  imports: [TypeOrmModule.forFeature([AfkFarm]), UsernamesModule],
  providers: [AfkFarmService], // Добавляем сервис имен пользователей
  controllers: [AfkFarmController], // Добавляем контроллер
  exports: [AfkFarmService],
})
export class AfkFarmModule {}
