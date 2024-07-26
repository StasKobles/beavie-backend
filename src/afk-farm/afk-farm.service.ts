import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfkFarm } from './afk-farm.entity';
import { UpdateAfkFarmDto } from './dto/update-afk-farm.dto';
import { UsernamesService } from '../usernames/usernames.service'; // Импортируем сервис для получения имен пользователей

@Injectable()
export class AfkFarmService {
  constructor(
    @InjectRepository(AfkFarm)
    private afkFarmRepository: Repository<AfkFarm>,
    private usernamesService: UsernamesService, // Добавляем сервис для получения имен пользователей
  ) {}

  async findAll(): Promise<AfkFarm[]> {
    return this.afkFarmRepository.find();
  }

  async findOne(telegram_id: number): Promise<AfkFarm> {
    const afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id },
    });
    if (!afkFarm) {
      throw new NotFoundException('AFK farm record not found');
    }
    return afkFarm;
  }

  async updateAfkFarm(updateAfkFarmDto: UpdateAfkFarmDto): Promise<AfkFarm> {
    let afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id: updateAfkFarmDto.telegram_id },
    });
    if (!afkFarm) {
      afkFarm = this.afkFarmRepository.create(updateAfkFarmDto);
    } else {
      afkFarm.coins_per_hour = updateAfkFarmDto.coins_per_hour;
      afkFarm.afk_start_time = updateAfkFarmDto.afk_start_time;
    }
    return this.afkFarmRepository.save(afkFarm);
  }

  async updateAfkStartTime(
    telegram_id: number,
    afk_start_time: Date,
  ): Promise<AfkFarm> {
    let afkFarm = await this.afkFarmRepository.findOne({
      where: { telegram_id },
    });
    if (!afkFarm) {
      afkFarm = this.afkFarmRepository.create({
        telegram_id,
        afk_start_time,
        coins_per_hour: 0,
      });
    } else {
      afkFarm.afk_start_time = afk_start_time;
    }
    return this.afkFarmRepository.save(afkFarm);
  }

  // Метод для получения топ-10 игроков по доходу в час
  async getTopEarnings(): Promise<any[]> {
    const topEarnings = await this.afkFarmRepository.find({
      order: { coins_per_hour: 'DESC' },
      take: 10,
    });

    const leaderBoard = await Promise.all(
      topEarnings.map(async (afkFarm, index) => {
        const username = await this.usernamesService.findOne(
          afkFarm.telegram_id,
        );
        return {
          rank: index + 1,
          telegram_id: afkFarm.telegram_id,
          coins_per_hour: afkFarm.coins_per_hour,
          username: username ? username.username : 'Unnamed User',
        };
      }),
    );

    return leaderBoard;
  }
}
