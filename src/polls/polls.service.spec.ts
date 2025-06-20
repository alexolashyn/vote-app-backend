import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Poll } from '../entities/poll.entity';
import { Vote } from '../entities/vote.entity';
import { Organization } from '../entities/organization.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PollsService', () => {
  let service: PollsService;

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockPollRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVoteRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        { provide: getRepositoryToken(Poll), useValue: mockPollRepository },
        { provide: getRepositoryToken(Vote), useValue: mockVoteRepository },
        { provide: getRepositoryToken(Organization), useValue: mockOrganizationRepository },
      ],
    }).compile();

    service = module.get<PollsService>(PollsService);

    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should throw if organization not found', async () => {
      mockOrganizationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPoll('Title', ['A', 'B'], 'desc', 1, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and save poll', async () => {
      const organization = { id: 1 };
      const poll = { title: 'Title', options: ['A', 'B'], description: 'desc', creatorId: 1, organization };
      mockOrganizationRepository.findOne.mockResolvedValue(organization);
      mockPollRepository.create.mockReturnValue(poll);
      mockPollRepository.save.mockResolvedValue({ ...poll, id: 1 });

      const result = await service.createPoll('Title', ['A', 'B'], 'desc', 1, 1);
      expect(result.id).toBe(1);
    });
  });

  describe('vote', () => {
    it('should throw if option is invalid', async () => {
      const poll = { id: 1, options: ['Yes', 'No'], votes: [] };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);

      await expect(service.vote(1, 'Maybe', 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw if user already voted', async () => {
      const poll = { id: 1, options: ['Yes', 'No'], votes: [] };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);
      mockVoteRepository.findOne.mockResolvedValue({ id: 10 });

      await expect(service.vote(1, 'Yes', 1)).rejects.toThrow(BadRequestException);
    });

    it('should save vote', async () => {
      const poll = { id: 1, options: ['Yes', 'No'], votes: [] };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);
      mockVoteRepository.findOne.mockResolvedValue(null);
      mockVoteRepository.create.mockReturnValue({ option: 'Yes', userId: 1, poll });
      mockVoteRepository.save.mockResolvedValue({ id: 2 });

      const result = await service.vote(1, 'Yes', 1);
      expect(result.id).toBe(2);
    });
  });

  describe('closePoll', () => {
    it('should throw if already inactive', async () => {
      const poll = { id: 1, isActive: false };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);

      await expect(service.closePoll(1)).rejects.toThrow(BadRequestException);
    });

    it('should set poll as inactive and save', async () => {
      const poll = { id: 1, isActive: true };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);
      mockPollRepository.save.mockResolvedValue({ ...poll, isActive: false });

      const result = await service.closePoll(1);
      expect(result.isActive).toBe(false);
    });
  });

  describe('getPollResult', () => {
    it('should throw if poll is still active', async () => {
      const poll = { id: 1, isActive: true, votes: [], options: [] };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);

      await expect(service.getPollResult(1)).rejects.toThrow(BadRequestException);
    });

    it('should return formatted poll results', async () => {
      const poll = {
        id: 1,
        isActive: false,
        options: ['A', 'B'],
        votes: [
          { option: 'A' },
          { option: 'A' },
          { option: 'B' },
        ],
      };
      jest.spyOn(service, 'getPollById').mockResolvedValue(poll as any);

      const result = await service.getPollResult(1);

      expect(result).toEqual([
        { option: 'A', votes: 2, percentage: '66.67%' },
        { option: 'B', votes: 1, percentage: '33.33%' },
      ]);
    });
  });
});
