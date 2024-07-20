import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usernames } from './usernames.entity';

@Injectable()
export class UsernamesService {
  constructor(
    @InjectRepository(Usernames)
    private usernamesRepository: Repository<Usernames>,
  ) {}

  async findOne(telegram_id: number): Promise<Usernames> {
    return this.usernamesRepository.findOne({ where: { telegram_id } });
  }

  async create(telegram_id: number, username: string): Promise<Usernames> {
    const newUsernames = this.usernamesRepository.create({
      telegram_id,
      username,
    });
    return this.usernamesRepository.save(newUsernames);
  }
}
