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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Alcatraz',
      database: process.env.DB_NAME || 'beavie_nest',
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
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
