import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateOrgDto } from '../src/dtos/create-org.dto';

describe('Organizations system (e2e)', () => {
  let app: INestApplication;
  let authToken: string; // Токен для авторизованого користувача

  const registerUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    return response.body.token;
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authToken = await registerUser('test.user@example.com', 'Password123');
  });

  afterEach(async () => {
    await app.close();
  });

  it('handles create organization request', async () => {
    const createOrgDto: CreateOrgDto = {
      name: 'Test Organization',
      members: [],
    };

    return request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201)
      .then((res) => {
        const { id, name } = res.body;
        expect(id).toBeDefined();
        expect(name).toEqual(createOrgDto.name);
      });
  });

  it('handles get organizations request for the user', async () => {

    const createOrgDto: CreateOrgDto = {
      name: 'User Org 1',
      members: [],
    };
    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201);

    return request(app.getHttpServer())
      .get('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toEqual('User Org 1');
      });
  });

  it('handles get organization by ID request', async () => {

    const createOrgDto: CreateOrgDto = {
      name: 'Specific Organization',
      members: [],
    };
    const createOrgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201);

    const orgId = createOrgResponse.body.id;

    return request(app.getHttpServer())
      .get(`/organizations/${orgId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((res) => {
        const { id, name } = res.body;
        expect(id).toEqual(orgId);
        expect(name).toEqual(createOrgDto.name);
      });
  });

  it('generates a key for an organization', async () => {

    const createOrgDto: CreateOrgDto = {
      name: 'Org with Key',
      members: [],
    };
    const createOrgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201);

    const orgId = createOrgResponse.body.id;

    return request(app.getHttpServer())
      .post(`/organizations/${orgId}/key`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201)
      .then((res) => {
        const { key } = res.body;
        expect(key).toBeDefined();
        expect(typeof key).toEqual('string');
        expect(key.length).toBeGreaterThan(0);
      });
  });

  it('sends a request to join an organization', async () => {

    const createOrgDto: CreateOrgDto = {
      name: 'Joinable Org',
      members: [],
    };
    const createOrgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201);

    const orgId = createOrgResponse.body.id;

    const keyResponse = await request(app.getHttpServer())
      .post(`/organizations/${orgId}/key`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);
    const orgKey = keyResponse.body.key;

    const anotherUserToken = await registerUser('another.user@example.com', 'Password123');

    return request(app.getHttpServer())
      .post('/organizations/request')
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ key: orgKey })
      .expect(201)
  });

  it('handles a join request (approve/reject) - (requires admin privileges)', async () => {


    // Крок 1: Створимо адміністратора та організацію
    const adminEmail = 'admin@example.com';
    const adminPassword = 'AdminPassword1';
    const adminToken = await registerUser(adminEmail, adminPassword);

    const createOrgDto: CreateOrgDto = {
      name: 'Admin Org',
      members: [],
    };
    const createOrgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createOrgDto)
      .expect(201);
    const orgId = createOrgResponse.body.id;

    const keyResponse = await request(app.getHttpServer())
      .post(`/organizations/${orgId}/key`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    const orgKey = keyResponse.body.key;

    const regularUserEmail = 'regular.user@example.com';
    const regularUserPassword = 'RegularPassword1';
    const regularUserToken = await registerUser(regularUserEmail, regularUserPassword);

    await request(app.getHttpServer())
      .post('/organizations/request')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ key: orgKey })
      .expect(201);

    const membersAndRequests = await request(app.getHttpServer())
      .get(`/organizations/${orgId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const joinRequest = membersAndRequests.body.requests.find(
      (req: any) => req.user.email === regularUserEmail,
    );
    expect(joinRequest).toBeDefined();
    const requestId = joinRequest.id;

    return request(app.getHttpServer())
      .post(`/organizations/${orgId}/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)
  });

  it('gets organization members (requires membership)', async () => {

    const createOrgDto: CreateOrgDto = {
      name: 'Members Org',
      members: [],
    };
    const createOrgResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrgDto)
      .expect(201);

    const orgId = createOrgResponse.body.id;

    return request(app.getHttpServer())
      .get(`/organizations/${orgId}/members`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body.members)).toBeTruthy();
        expect(res.body.members.length).toBeGreaterThan(0);
        expect(res.body.members.some((m: any) => m.email === 'test.user@example.com')).toBeTruthy();
      });
  });
});