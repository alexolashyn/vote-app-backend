import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct params and return result', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const result = { id: 1, email: dto.email };
      mockAuthService.register.mockResolvedValue(result);

      const res = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto.email, dto.password);
      expect(res).toEqual(result);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct params and return result', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const result = { accessToken: 'token' };
      mockAuthService.login.mockResolvedValue(result);

      const res = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(res).toEqual(result);
    });
  });

  describe('getProfile', () => {
    it('should return user from request object', () => {
      const user = { id: 1, email: 'test@example.com' };
      const req = { user };

      const res = controller.getProfile(req as any);

      expect(res).toEqual(user);
    });
  });
});
