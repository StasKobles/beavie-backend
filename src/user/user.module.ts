import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AfkFarm } from 'src/user/entities/afk-farm.entity';
import { Balance } from 'src/user/entities/balance.entity';
import { DailyBonus } from 'src/user/entities/daily-bonus.entity';
import { Referral } from 'src/user/entities/referral.entity';
import { UserQuest } from 'src/user/entities/user-quest.entity';
import { UserUpgrade } from 'src/user/entities/user-upgrade.entity';
import { Usernames } from 'src/user/entities/usernames.entity';
import { UpgradeModule } from 'src/upgrade/upgrade.module';
import { QuestModule } from 'src/quest/quest.module';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { Quest } from 'src/quest/quest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Referral,
      UserUpgrade,
      UserQuest,
      Balance,
      AfkFarm,
      DailyBonus,
      Usernames,
      Upgrade,
      Quest,
    ]),
    UpgradeModule,
    QuestModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
