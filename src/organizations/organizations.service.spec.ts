import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Request } from '../entities/request.entity';
import { JwtService } from '@nestjs/jwt';  // Import JwtService

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRequestRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    verify: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Organization), useValue: mockOrganizationRepository },
        { provide: getRepositoryToken(Request), useValue: mockRequestRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('OrganizationsService - createOrganization', () => {
    it('should throw NotFoundException if creator is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createOrganization('Test Org', ['test@example.com'], 1),
      ).rejects.toThrow('User is not found!');
    });

    it('should throw BadRequestException for unknown member emails', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, role: 'USER' });
      mockUserRepository.save.mockResolvedValue({});
      mockUserRepository.find.mockResolvedValue([]); // No members found

      await expect(
        service.createOrganization('Test Org', ['unknown@example.com'], 1),
      ).rejects.toThrow('Following users are not found: unknown@example.com');
    });

    it('should create organization and return data', async () => {
      const creator = { id: 1, role: 'USER' };
      const member = { id: 2, email: 'member@example.com' };
      const savedOrg = {
        id: 1,
        name: 'Test Org',
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(creator);
      mockUserRepository.save.mockResolvedValue({ ...creator, role: 'ADMIN' });
      mockUserRepository.find.mockResolvedValue([member]);
      mockOrganizationRepository.create.mockReturnValue({ name: 'Test Org', members: [member], creatorId: 1 });
      mockOrganizationRepository.save.mockResolvedValue(savedOrg);

      const result = await service.createOrganization('Test Org', ['member@example.com'], 1);

      expect(result).toMatchObject({
        id: savedOrg.id,
        name: savedOrg.name,
        polls: [],
      });
    });
  });

  describe('OrganizationsService - generateKey', () => {
    it('should return a signed key', async () => {
      mockOrganizationRepository.findOne.mockResolvedValue({ id: 1, members: [] });

      const result = await service.generateKey(1);
      expect(result).toEqual({ key: 'mocked-jwt-token' });
    });
  });

  describe('OrganizationsService - sendRequest', () => {
    it('should throw if user is already a member', async () => {
      const user = { id: 1 };
      mockJwtService.verify.mockReturnValue({ orgId: 123 });
      mockOrganizationRepository.findOne.mockResolvedValue({ id: 123, members: [{ id: 1 }] });

      await expect(service.sendRequest(user as any, 'mocked-jwt')).rejects.toThrow('User is already a member!');
    });

    it('should throw if request already exists', async () => {
      const user = { id: 2 };
      const org = { id: 123, members: [] };
      mockJwtService.verify.mockReturnValue({ orgId: 123 });
      mockOrganizationRepository.findOne.mockResolvedValue(org);
      mockRequestRepository.findOne.mockResolvedValue({});

      await expect(service.sendRequest(user as any, 'mocked-jwt')).rejects.toThrow('Request already exists!');
    });

    it('should create and save a request', async () => {
      const user = { id: 2 };
      const org = { id: 123, members: [] };
      mockJwtService.verify.mockReturnValue({ orgId: 123 });
      mockOrganizationRepository.findOne.mockResolvedValue(org);
      mockRequestRepository.findOne.mockResolvedValue(null);
      mockRequestRepository.create.mockReturnValue({ user, organization: org });
      mockRequestRepository.save.mockResolvedValue({ id: 1 });

      const result = await service.sendRequest(user as any, 'mocked-jwt');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('OrganizationsService - handleJoinRequest', () => {
    it('should reject if request is not found', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);
      mockOrganizationRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.handleJoinRequest(1, 1, true)).rejects.toThrow('Request is not found!');
    });

    it('should reject if request already processed', async () => {
      mockRequestRepository.findOne.mockResolvedValue({ status: 'APPROVED' });
      mockOrganizationRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.handleJoinRequest(1, 1, true)).rejects.toThrow('Request has already been processed!');
    });

  });

});
