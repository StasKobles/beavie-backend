import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { Quest } from './quest.entity';
import { QuestTranslation } from './quest-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, QuestTranslation])],
  providers: [QuestService],
  controllers: [QuestController],
  exports: [QuestService],
})
export class QuestModule {}
