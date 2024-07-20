import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    this.logger.log(`Found ${users.length} users`);
    return users;
  }

  async findOne(telegram_id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { telegram_id } });
    this.logger.log(`User ${telegram_id} found: ${!!user}`);
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`User created: ${savedUser.telegram_id}`);
    return savedUser;
  }

  async delete(telegram_id: number): Promise<void> {
    await this.userRepository.delete({ telegram_id });
    this.logger.log(`User deleted: ${telegram_id}`);
  }
}
