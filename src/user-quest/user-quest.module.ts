import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestService } from './user-quest.service';
import { UserQuestController } from './user-quest.controller';
import { UserQuest } from './user-quest.entity';
import { QuestModule } from '../quest/quest.module';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuest]), QuestModule, BalanceModule],
  providers: [UserQuestService],
  controllers: [UserQuestController],
})
export class UserQuestModule {}
