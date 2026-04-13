import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreatePollDto } from '../src/dtos/create-poll.dto';
import { CreateOrgDto } from '../src/dtos/create-org.dto';

describe('Polls system (e2e)', () => {
  let app: INestApplication;
  let authToken: string; // Non-admin token
  let adminAuthToken: string; // Admin token
  let orgId: number; // Organization ID created for tests

  // Helper function to register a user
  const registerUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    return response.body.token;
  };

  // Helper function to create an organization
  const createOrganization = async (token: string, name: string, members: string[]) => {
    const createOrgDto: CreateOrgDto = { name, members };
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrgDto)
      .expect(201);
    return response.body.id;
  };

  // Helper function to create a poll
  const createPoll = async (token: string, orgId: number, title: string, options: string[], description?: string) => {
    const createPollDto: CreatePollDto = { title, options, description };
    const response = await request(app.getHttpServer())
      .post(`/polls/${orgId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(createPollDto)
      .expect(201);
    return response.body.id;
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register a regular user and get token
    authToken = await registerUser('poll.user@example.com', 'Password123');

    // Register an admin user and get token
    adminAuthToken = await registerUser('poll.admin@example.com', 'AdminPassword123');

    // Create an organization where both users are members, and admin is the creator
    orgId = await createOrganization(adminAuthToken, 'Poll Test Org', ['poll.user@example.com', 'poll.admin@example.com']);
  });

  afterEach(async () => {
    await app.close();
  });

  it('handles create poll request', async () => {
    const createPollDto: CreatePollDto = {
      title: 'Favourite Programming Language?',
      options: ['JavaScript', 'Python', 'TypeScript', 'Java'],
      description: 'Choose your preferred language.',
    };

    return request(app.getHttpServer())
      .post(`/polls/${orgId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(createPollDto)
      .expect(201)
      .then((res) => {
        const { id, title, options } = res.body;
        expect(id).toBeDefined();
        expect(title).toEqual(createPollDto.title);
        expect(options).toEqual(expect.arrayContaining(createPollDto.options));
      });
  });

  it('gets a poll by ID', async () => {
    // Create a poll for testing
    const pollId = await createPoll(
      authToken,
      orgId,
      'Test Poll for ID',
      ['Option A', 'Option B'],
    );

    return request(app.getHttpServer())
      .get(`/polls/${pollId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((res) => {
        const { id, title } = res.body;
        expect(id).toEqual(pollId);
        expect(title).toEqual('Test Poll for ID');
      });
  });

  it('handles vote request', async () => {
    // Create a poll
    const pollId = await createPoll(
      authToken,
      orgId,
      'Vote Test Poll',
      ['Vote Option 1', 'Vote Option 2'],
    );

    return request(app.getHttpServer())
      .post(`/polls/${pollId}/vote`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ option: 'Vote Option 1' })
      .expect(201)
  });

  it('handles close poll request (requires admin)', async () => {
    // Create a poll as admin
    const pollId = await createPoll(
      adminAuthToken,
      orgId,
      'Poll to Close',
      ['Opt 1', 'Opt 2'],
    );

    return request(app.getHttpServer())
      .post(`/polls/${pollId}/close`)
      .set('Authorization', `Bearer ${adminAuthToken}`) // Use admin token
      .expect(201)
  });

  it('fails to close poll if not admin', async () => {
    // Create a poll as a regular user
    const pollId = await createPoll(
      authToken,
      orgId,
      'Poll to fail close',
      ['Opt A', 'Opt B'],
    );

    return request(app.getHttpServer())
      .post(`/polls/${pollId}/close`)
      .set('Authorization', `Bearer ${authToken}`) // Use regular user token
      .expect(403); // Expect Forbidden (missing admin rights)
  });


});