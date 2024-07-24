import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestService } from './user-quest.service';
import { UserQuestController } from './user-quest.controller';
import { UserQuest } from './user-quest.entity';
import { QuestModule } from '../quest/quest.module';
import { BalanceModule } from '../balance/balance.module';
import { ReferralModule } from '../referral/referral.module'; // Импортируем ReferralModule

@Module({
  imports: [
    TypeOrmModule.forFeature([UserQuest]),
    QuestModule,
    BalanceModule,
    ReferralModule, // Добавляем ReferralModule
  ],
  providers: [UserQuestService],
  controllers: [UserQuestController],
  exports: [UserQuestService],
})
export class UserQuestModule {}
