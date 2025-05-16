import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles register request', () => {
    const email = 'jane.doe@example.com';
    const password = 'Qwerty12';
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { token } = res.body;
        expect(token).toBeDefined();
      });
  });
  it('handles profile request', async () => {
    const email = 'john.doe@example.com';
    const password = 'Qwerty12';
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    const { token } = response.body;
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        const { email: authEmail, id } = res.body;
        expect(id).toBeDefined();
        expect(authEmail).toEqual(email);
      });
  });
});
