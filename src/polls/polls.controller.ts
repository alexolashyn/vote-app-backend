import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {CreatePollDto} from '../dtos/create-poll.dto';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private readonly pollsService: PollsService) {
  }

  @Post()
  createPoll(@Body() body: CreatePollDto, @Request() req) {
    return this.pollsService.createPoll(body.title, body.options, req.user.id, body.description);
  }

  @Get()
  getAllPolls() {
    return this.pollsService.getAllPolls();
  }

  @Get(':id')
  getPollById(@Param('id') id: number) {
    return this.pollsService.getPollById(id);
  }

  @Post(':id/vote')
  vote(
    @Param('id') id: number,
    @Body() body: { option: string },
    @Request() req,
  ) {
    return this.pollsService.vote(id, body.option, req.user.id);
  }
}
