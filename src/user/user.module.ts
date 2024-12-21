import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from 'src/quest/quest.entity';
import { QuestModule } from 'src/quest/quest.module';
import { Upgrade } from 'src/upgrade/upgrade.entity';
import { UpgradeModule } from 'src/upgrade/upgrade.module';
import { AfkFarm } from 'src/user/entities/afk-farm.entity';
import { Balance } from 'src/user/entities/balance.entity';
import { DailyBonus } from 'src/user/entities/daily-bonus.entity';
import { Referral } from 'src/user/entities/referral.entity';
import { UserQuest } from 'src/user/entities/user-quest.entity';
import { UserUpgrade } from 'src/user/entities/user-upgrade.entity';
import { Username } from 'src/user/entities/username.entity';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';

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
      Username,
      Upgrade,
      Quest,
    ]),
    UpgradeModule,
    QuestModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
