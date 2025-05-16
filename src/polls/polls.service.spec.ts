import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Poll } from '../entities/poll.entity';
import { Organization } from '../entities/organization.entity';
import { Vote } from '../entities/vote.entity';

describe('PollsService', () => {
  let service: PollsService;

  const mockOrganizationRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
        { provide: getRepositoryToken(Organization), useValue: mockOrganizationRepository },
        { provide: getRepositoryToken(Vote), useValue: mockVoteRepository },
      ],
    }).compile();

    service = module.get<PollsService>(PollsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


