import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upgrade } from './upgrade.entity';

@Injectable()
export class UpgradeService {
  constructor(
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
  ) {}

  async findAll(): Promise<Upgrade[]> {
    return this.upgradeRepository.find();
  }
}
