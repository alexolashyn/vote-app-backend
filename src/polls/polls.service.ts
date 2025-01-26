import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { Vote } from './vote.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {
  }

  async createPoll(title: string, options: string[], creatorId: number, description: string = null) {
    const poll = this.pollRepository.create({
      title,
      options,
      creatorId,
      description,
    });
    return this.pollRepository.save(poll);
  }

  async getAllPolls() {
    return this.pollRepository.find();
  }

  async getPollById(id: number) {
    const poll = await this.pollRepository.findOne({ where: { id }, relations: ['votes'] });
    if (!poll) {
      throw new NotFoundException('Poll is not found!');
    }
    return poll;
  }

  async vote(pollId: number, option: string, userId: number) {
    const poll = await this.getPollById(pollId);

    poll.checkActive();
    if (!poll.isActive) {
      await this.pollRepository.save(poll);
      throw new BadRequestException('Poll is not active!');
    }

    if (!poll.options.includes(option)) {
      throw new NotFoundException('Invalid option!');
    }

    const existingVote = await this.voteRepository.findOne({
      where: { poll: { id: pollId }, userId },
    });
    if (existingVote) {
      throw new BadRequestException('User has already voted!');
    }

    const vote = this.voteRepository.create({ poll, option, userId });
    return this.voteRepository.save(vote);
  }
}
