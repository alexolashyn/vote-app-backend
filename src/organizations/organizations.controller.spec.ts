import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MembershipGuard } from '../guards/membership.guard';
import { AdminGuard } from '../guards/admin.guard';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  const mockOrganizationsService = {
    createOrganization: jest.fn(),
    getUserOrganizations: jest.fn(),
    getOrganizationById: jest.fn(),
    generateKey: jest.fn(),
    sendRequest: jest.fn(),
    handleJoinRequest: jest.fn(),
    getMembersAndRequests: jest.fn(),
    getMembers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(MembershipGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should call service.createOrganization and return result', async () => {
      const dto = { name: 'Test Org', members: ['member@example.com'] };
      const result = { id: 1, name: 'Test Org' };
      mockOrganizationsService.createOrganization.mockResolvedValue(result);

      const res = await controller.createOrganization(dto, {
        user: { id: 1 },
      } as any);

      expect(mockOrganizationsService.createOrganization).toHaveBeenCalledWith(
        dto.name,
        dto.members,
        1,
      );
      expect(res).toEqual(result);
    });
  });

  describe('getOrganizations', () => {
    it('should call service.getUserOrganizations and return result', async () => {
      const result = [{ id: 1, name: 'Test Org' }];
      mockOrganizationsService.getUserOrganizations.mockResolvedValue(result);

      const res = await controller.getOrganizations({ user: { id: 1 } } as any);

      expect(
        mockOrganizationsService.getUserOrganizations,
      ).toHaveBeenCalledWith(1);
      expect(res).toEqual(result);
    });
  });

  describe('getOrganizationById', () => {
    it('should call service.getOrganizationById and return result', async () => {
      const result = { id: 1, name: 'Test Org' };
      mockOrganizationsService.getOrganizationById.mockResolvedValue(result);

      const res = await controller.getOrganizationById('1' as any);

      expect(mockOrganizationsService.getOrganizationById).toHaveBeenCalledWith(
        '1',
      );
      expect(res).toEqual(result);
    });
  });

  describe('generateKey', () => {
    it('should call service.generateKey and return result', async () => {
      const result = { key: 'test-key' };
      mockOrganizationsService.generateKey.mockResolvedValue(result);

      const res = await controller.generateKey('1' as any);

      expect(mockOrganizationsService.generateKey).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });
  });

  describe('sendRequest', () => {
    it('should call service.sendRequest and return result', async () => {
      const result = { id: 1 };
      mockOrganizationsService.sendRequest.mockResolvedValue(result);

      const res = await controller.sendRequest(
        { user: { id: 1 } } as any,
        'test-key',
      );

      expect(mockOrganizationsService.sendRequest).toHaveBeenCalledWith(
        { id: 1 },
        'test-key',
      );
      expect(res).toEqual(result);
    });
  });

  describe('handleRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call service.handleJoinRequest with approve action', async () => {
      const result = { id: 1, status: 'APPROVED' };
      mockOrganizationsService.handleJoinRequest.mockResolvedValue(result);

      const res = await controller.handleRequest(
        '1' as any,
        '1' as any,
        'approve',
      );

      expect(mockOrganizationsService.handleJoinRequest).toHaveBeenCalledWith(
        '1',
        '1',
        true,
      );
      expect(res).toEqual(result);
    });

    it('should call service.handleJoinRequest with reject action', async () => {
      const result = { id: 1, status: 'REJECTED' };
      mockOrganizationsService.handleJoinRequest.mockResolvedValue(result);

      const res = await controller.handleRequest(
        '1' as any,
        '1' as any,
        'reject',
      );

      expect(mockOrganizationsService.handleJoinRequest).toHaveBeenCalledWith(
        '1',
        '1',
        false,
      );
      expect(res).toEqual(result);
    });
  });

  describe('getOrganizationMembers', () => {
    it('should call service.getMembersAndRequests when isCreatorAdmin', async () => {
      const result = { members: [], requests: [] };
      mockOrganizationsService.getMembersAndRequests.mockResolvedValue(result);

      const res = await controller.getOrganizationMembers(
        '1' as any,
        { isCreatorAdmin: true } as any,
      );

      expect(
        mockOrganizationsService.getMembersAndRequests,
      ).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });

    it('should call service.getMembers when not isCreatorAdmin', async () => {
      const result = [{ id: 1, email: 'test@example.com' }];
      mockOrganizationsService.getMembers.mockResolvedValue(result);

      const res = await controller.getOrganizationMembers(
        '1' as any,
        { isCreatorAdmin: false } as any,
      );

      expect(mockOrganizationsService.getMembers).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });
  });
});
