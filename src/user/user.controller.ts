import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':telegram_id')
  findOne(@Param('telegram_id') telegram_id: number): Promise<User> {
    return this.userService.findOne(telegram_id);
  }

  @Post()
  create(@Body() user: Partial<User>): Promise<User> {
    return this.userService.create(user);
  }

  @Delete(':telegram_id')
  delete(@Param('telegram_id') telegram_id: number): Promise<void> {
    return this.userService.delete(telegram_id);
  }
}
