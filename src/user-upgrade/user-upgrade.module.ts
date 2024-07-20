import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUpgradeService } from './user-upgrade.service';
import { UserUpgradeController } from './user-upgrade.controller';
import { UserUpgrade } from './user-upgrade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserUpgrade])],
  providers: [UserUpgradeService],
  controllers: [UserUpgradeController],
})
export class UserUpgradeModule {}
