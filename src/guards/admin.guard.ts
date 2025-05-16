import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PollsService } from '../polls/polls.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly pollsService: PollsService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role, id: userId } = request.user;
    const { pollId, orgId } = request.params;

    if (!pollId && !orgId) {
      throw new ForbiddenException('Poll ID or Organization ID is required!');
    }

    const organization = await (pollId
      ? this.getOrgByPollId(pollId)
      : this.getOrgById(orgId));

    const isCreatorAdmin = role === UserRole.ADMIN && organization.creatorId === userId;
    if (!isCreatorAdmin) {
      throw new ForbiddenException('You are not authorized to access this resource!');
    }

    return true;
  }

  private async getOrgByPollId(pollId: number) {
    const poll = await this.pollsService.getPollById(pollId);
    return poll.organization;
  }

  private async getOrgById(orgId: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
      relations: ['members'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found!');
    }

    return organization;
  }
}
