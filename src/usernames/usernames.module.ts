import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsernamesService } from './usernames.service';
import { Usernames } from './usernames.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usernames])],
  providers: [UsernamesService],
  exports: [UsernamesService],
})
export class UsernamesModule {}
