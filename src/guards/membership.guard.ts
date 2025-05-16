import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PollsService } from '../polls/polls.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly pollsService: PollsService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const pollId = request.params.pollId;
    const orgId = request.params.orgId;

    if (!pollId && !orgId) {
      throw new ForbiddenException('Poll ID or Organization ID is required!');
    }

    const organization = await (pollId
        ? this.getOrgByPollId(pollId)
        : this.getOrgById(orgId)
    );

    if (!organization.members.some(member => member.id === user.id)) {
      throw new ForbiddenException('You are not a member of this organization!');
    }

    request.isCreatorAdmin = organization.creatorId === user.id && user.role === UserRole.ADMIN;
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
