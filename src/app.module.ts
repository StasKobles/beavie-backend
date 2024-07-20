import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { QuestModule } from './quest/quest.module';
import { UserModule } from './user/user.module';
import { BalanceModule } from './balance/balance.module';
import { ReferralModule } from './referral/referral.module';
import { DailyBonusModule } from './daily-bonus/daily-bonus.module';
import { UserQuestModule } from './user-quest/user-quest.module';
import { UpgradeModule } from './upgrade/upgrade.module';
import { UserUpgradeModule } from './user-upgrade/user-upgrade.module';
import { UsernamesModule } from './usernames/usernames.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AfkFarmModule } from './afk-farm/afk-farm.module';
import { BalanceUpdateModule } from './balance-update/balance-update.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Включаем синхронизацию для тестовой базы
    }),
    UserModule,
    BalanceModule,
    ReferralModule,
    DailyBonusModule,
    QuestModule,
    UserQuestModule,
    UpgradeModule,
    UserUpgradeModule,
    UsernamesModule,
    AfkFarmModule,
    BalanceUpdateModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
