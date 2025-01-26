import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { Vote } from './vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Vote])],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
