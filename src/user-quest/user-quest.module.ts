import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestService } from './user-quest.service';
import { UserQuestController } from './user-quest.controller';
import { UserQuest } from './user-quest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuest])],
  providers: [UserQuestService],
  controllers: [UserQuestController],
})
export class UserQuestModule {}
