import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request, BadRequestException,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from '../dtos/create-poll.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MembershipGuard } from '../guards/membership.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('polls')
@UseGuards(MembershipGuard)
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private readonly pollsService: PollsService) {
  }

  @Post(':orgId')
  createPoll(
    @Body() body: CreatePollDto,
    @Request() req,
    @Param('orgId') orgId: number,
  ) {
    const { title, options, description } = body;
    const { id: userId } = req.user;
    return this.pollsService.createPoll(title, options, description, userId, orgId);
  }

  @Get(':pollId')
  getPollById(@Param('pollId') id: number) {
    return this.pollsService.getPollById(id);
  }

  @Post(':pollId/vote')
  vote(
    @Param('pollId') id: number,
    @Body() body: { option: string },
    @Request() req,
  ) {
    const { option } = body;
    if (!option) {
      throw new BadRequestException('Option is required!');
    }
    const { id: userId } = req.user;
    return this.pollsService.vote(id, option, userId);
  }

  @Post(':pollId/close')
  @UseGuards(AdminGuard)
  closePoll(@Param('pollId') id: number) {
    return this.pollsService.closePoll(id);
  }

  @Get(':pollId/result')
  getPollResult(@Param('pollId') id: number) {
    return this.pollsService.getPollResult(id);
  }

}
