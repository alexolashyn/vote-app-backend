import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(async (options) => {
      if (options?.where?.email === 'existing@example.com') {
        return { id: 1, email: 'existing@example.com', password: await bcrypt.hash('Qwerty12', 10) };
      }
      return null;
    }),

    create: jest.fn((user) => {
      return { id: Math.ceil(Math.random() * 1000), ...user } as User;
    }),

    save: jest.fn(async (user) => {
      return { id: user.id, ...user } as User;
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mocked_token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('creates new user with hashed password', async () => {
    const email = 'john.doe@example.com';
    const password = 'Qwerty12';

    const result = await service.register(email, password);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } });

    expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email }));

    const savedUser = mockUserRepository.save.mock.calls[0][0];
    expect(savedUser.password).not.toBe(password);

    const isMatch = await bcrypt.compare(password, savedUser.password);
    expect(isMatch).toBe(true);

    expect(result).toHaveProperty('token');
  });

  it('throws an error if provided email is already in use', async () => {
    const email = 'existing@example.com';
    const password = 'Qwerty12';
    await expect(() => service.register(email, password)).rejects.toThrow(BadRequestException);
  });

  it('throws an error if user tries to login with unused email', async () => {
    const email = 'john.doe@example.com';
    const password = 'Qwerty12';
    await expect(() => service.login(email, password)).rejects.toThrow(NotFoundException);
  });

  it('throws an error if provided password does not matched stored one', async () => {
    const email = 'existing@example.com';
    const password = 'Qwerty123';
    await expect(() => service.login(email, password)).rejects.toThrow(BadRequestException);
  });

  it('returns a token if provided credentials are valid', async () => {
    const email = 'existing@example.com';
    const password = 'Qwerty12';
    const result = await service.login(email, password);
    expect(result).toHaveProperty('token');
  });

});
