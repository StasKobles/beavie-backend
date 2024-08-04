import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';

const mockUserService = {
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if validation is successful', async () => {
      const user = { id: 1, telegram_id: 123456, username: 'testuser' };
      mockUserService.findOne.mockResolvedValue(user);

      const result = await authService.validateUser('valid-init-data');
      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if validation fails', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        authService.validateUser('invalid-init-data'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { id: 1, telegram_id: 123456, username: 'testuser' };
      const result = await authService.login(user);

      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
