import { Injectable, BadRequestException, NotFoundException, ForbiddenException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User, UserRole } from '../entities/user.entity';
import { Request, RequestStatus } from '../entities/request.entity';
import { JwtService } from '@nestjs/jwt';
import { In } from 'typeorm';


@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly jwtService: JwtService,
  ) {
  }

  async createOrganization(name: string, memberEmails: string[], creatorId: number) {
    const creator = await this.userRepository.findOne({ where: { id: creatorId } });
    if (!creator) {
      throw new NotFoundException('User is not found!');
    }

    creator.role = UserRole.ADMIN;
    await this.userRepository.save(creator);

    const members = await this.userRepository.find({
      where: {
        email: In(memberEmails),
      },
    });

    const usedEmails = new Set(members.map((user) => user.email));
    const notFoundEmails = memberEmails.filter((email) => !usedEmails.has(email));
    if (notFoundEmails.length > 0) {
      throw new BadRequestException(`Following users are not found: ${notFoundEmails.join(', ')}`);
    }

    const organization = this.organizationRepository.create({
      name,
      members,
      creatorId,
    });

    const newOrganization = await this.organizationRepository.save(organization);
    return {
      id: newOrganization.id,
      name: newOrganization.name,
      createdAt: newOrganization.createdAt,
      polls: [],
    };
  }

  async getUserOrganizations(userId: string) {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoin('organization.members', 'user')
      .leftJoinAndSelect('organization.polls', 'poll')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async getOrganizationById(orgId: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
      relations: ['members', 'polls'],
    });

    if (!organization) {
      throw new NotFoundException('Organization is not found!');
    }

    return organization;
  }

  isMember(organization: Organization, userId: number) {
    return organization.members.some((member) => member.id === userId);
  }

  async generateKey(orgId: number) {
    await this.getOrganizationById(orgId);

    const payload = { orgId };
    const key = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { key };
  }

  async sendRequest(user: User, key: string) {
    const { orgId } = this.jwtService.verify(key);
    const organization = await this.getOrganizationById(orgId);

    const { id: userId } = user;

    if (this.isMember(organization, userId)) {
      throw new BadRequestException('User is already a member!');
    }

    const existingRequest = await this.requestRepository.findOne({
      where: {
        user: { id: userId },
        organization: { id: orgId },
        status: RequestStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException('Request already exists!');
    }

    const request = this.requestRepository.create({
      user,
      organization,
    });

    return this.requestRepository.save(request);
  }

  async handleJoinRequest(orgId: number, requestId: number, response: boolean) {
    await this.getOrganizationById(orgId);

    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['user', 'organization', 'organization.members'],
    });

    if (!request) {
      throw new NotFoundException('Request is not found!');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request has already been processed!');
    }

    request.status = response ? RequestStatus.APPROVED : RequestStatus.REJECTED;

    if (response) {
      request.organization.members.push(request.user);
      await this.organizationRepository.save(request.organization);
    }

    return this.requestRepository.save(request);
  }

  async getMembers(orgId: number) {
    const organization = await this.getOrganizationById(orgId);

    return { members: organization.members };
  }

  async getMembersAndRequests(orgId: number) {
    const { members } = await this.getMembers(orgId);
    const requests = await this.requestRepository.find({
      where: { organization: { id: orgId }, status: RequestStatus.PENDING },
      relations: ['user'],
    });
    return {
      members,
      requests: requests.map((request) => ({
        id: request.id,
        user: request.user,
      })),
    };
  }
}