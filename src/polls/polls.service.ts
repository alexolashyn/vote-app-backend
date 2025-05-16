import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../entities/poll.entity';
import { Vote } from '../entities/vote.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {
  }

  async createPoll(title: string, options: string[], description: string = null, userId: number, orgId: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException('Organization is not found!');
    }

    const poll = this.pollRepository.create({
      title,
      options,
      creatorId: userId,
      description,
      organization,
    });
    return this.pollRepository.save(poll);
  }

  async getPollById(pollId: number) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['votes', 'organization', 'organization.members'],
    });

    if (!poll) {
      throw new NotFoundException('Poll is not found!');
    }

    return poll;
  }

  async vote(pollId: number, option: string, userId: number) {
    const poll = await this.getPollById(pollId);

    if (!poll.options.includes(option)) {
      throw new BadRequestException('Invalid option!');
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

  async closePoll(pollId: number) {
    const poll = await this.getPollById(pollId);

    if (!poll.isActive) {
      throw new BadRequestException('Poll is already inactive!');
    }
    poll.isActive = false;
    return this.pollRepository.save(poll);
  }

  async getPollResult(pollId: number) {
    const poll = await this.getPollById(pollId);
    if (poll.isActive) {
      throw new BadRequestException('Poll is not finished yet!');
    }

    const { votes, options } = poll;
    const totalVotes = votes.length;

    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.option] = (acc[vote.option] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = options.map(option => {
      const count = voteCounts[option] || 0;
      const percentage = totalVotes === 0 ? '0.00%' : ((count / totalVotes) * 100).toFixed(2) + '%';
      return {
        option,
        votes: count,
        percentage,
      };
    });

    return result;
  }
}
