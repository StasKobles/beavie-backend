import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { QuestModule } from './quest/quest.module';
import { UpgradeModule } from './upgrade/upgrade.module';

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
    ScheduleModule.forRoot(),
    UserModule,
    QuestModule,
    UpgradeModule,
  ],
})
export class AppModule {}
