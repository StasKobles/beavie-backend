import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const req = { body: { initDataRaw: 'valid-init-data' } };
      const user = { id: 1, telegram_id: 123456, username: 'testuser' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue({ access_token: 'signed-token' });

      const result = await authController.login(req);

      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw an error if validation fails', async () => {
      const req = { body: { initDataRaw: 'invalid-init-data' } };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(authController.login(req)).rejects.toThrow();
    });
  });
});
