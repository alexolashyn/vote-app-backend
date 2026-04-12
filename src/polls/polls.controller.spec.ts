import { Test, TestingModule } from '@nestjs/testing';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { MembershipGuard } from '../guards/membership.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

describe('PollsController', () => {
  let controller: PollsController;

  const mockPollsService = {
    createPoll: jest.fn(),
    getPollById: jest.fn(),
    vote: jest.fn(),
    closePoll: jest.fn(),
    getPollResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollsController],
      providers: [
        {
          provide: PollsService,
          useValue: mockPollsService,
        },
      ],
    })
      .overrideGuard(MembershipGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PollsController>(PollsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPoll', () => {
    it('should call service.createPoll and return result', async () => {
      const dto = { title: 'Test Poll', options: ['A', 'B'], description: 'Test' };
      const result = { id: 1, title: 'Test Poll' };
      mockPollsService.createPoll.mockResolvedValue(result);

      const res = await controller.createPoll(dto, { user: { id: 1 } } as any, 1);

      expect(mockPollsService.createPoll).toHaveBeenCalledWith(dto.title, dto.options, dto.description, 1, 1);
      expect(res).toEqual(result);
    });
  });

  describe('getPollById', () => {
    it('should call service.getPollById and return result', async () => {
      const result = { id: 1, title: 'Test Poll' };
      mockPollsService.getPollById.mockResolvedValue(result);

      const res = await controller.getPollById(1);

      expect(mockPollsService.getPollById).toHaveBeenCalledWith(1);
      expect(res).toEqual(result);
    });
  });

  describe('vote', () => {
    it('should call service.vote and return result', async () => {
      const body = { option: 'A' };
      const result = { id: 1, option: 'A' };
      mockPollsService.vote.mockResolvedValue(result);

      const res = await controller.vote(1, body, { user: { id: 1 } } as any);

      expect(mockPollsService.vote).toHaveBeenCalledWith(1, 'A', 1);
      expect(res).toEqual(result);
    });
  });

  describe('closePoll', () => {
    it('should call service.closePoll and return result', async () => {
      const result = { id: 1, isActive: false };
      mockPollsService.closePoll.mockResolvedValue(result);

      const res = await controller.closePoll(1);

      expect(mockPollsService.closePoll).toHaveBeenCalledWith(1);
      expect(res).toEqual(result);
    });
  });

  describe('getPollResult', () => {
    it('should call service.getPollResult and return result', async () => {
      const result = [{ option: 'A', votes: 10, percentage: '50%' }];
      mockPollsService.getPollResult.mockResolvedValue(result);

      const res = await controller.getPollResult(1);

      expect(mockPollsService.getPollResult).toHaveBeenCalledWith(1);
      expect(res).toEqual(result);
    });
  });
});
