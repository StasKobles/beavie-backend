import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { Quest } from './quest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest])],
  providers: [QuestService],
  controllers: [QuestController],
  exports: [QuestService],
})
export class QuestModule {}
