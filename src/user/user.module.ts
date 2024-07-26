import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UsernamesModule } from '../usernames/usernames.module';
import { BalanceModule } from '../balance/balance.module';
import { DailyBonusModule } from '../daily-bonus/daily-bonus.module'; // Импортируем DailyBonusModule
import { ReferralModule } from '../referral/referral.module';
import { UserQuestModule } from 'src/user-quest/user-quest.module';
import { UserUpgradeModule } from 'src/user-upgrade/user-upgrade.module';
import { AfkFarmModule } from 'src/afk-farm/afk-farm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Импортируем сущность User
    UsernamesModule, // Импортируем модуль Usernames
    BalanceModule, // Импортируем модуль Balance
    DailyBonusModule, // Импортируем модуль DailyBonus
    ReferralModule, // Импортируем модуль Referral
    UserQuestModule, // Импортируйте UserQuestModule
    UserUpgradeModule, // Импортируйте UserUpgradeModule
    AfkFarmModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
